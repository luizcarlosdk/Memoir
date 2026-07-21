"""Endpoint tests for meeting summarization."""

from collections.abc import Generator
from datetime import datetime, timezone

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

import app.main as main
from app.core.meeting_inteligence import ExtractedActionItem, MeetingInsight
from app.database.connection import get_db_session
from app.database.models import ActionItem, Base, Meeting, Person, User, Workspace
from app.parsers.base import TranscriptSegment


TEST_WORKSPACE_ID = "1"


@pytest.fixture()
def db_session_factory() -> Generator[sessionmaker[Session], None, None]:
    """Create an isolated in-memory SQLite database for each test."""
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(engine)
    session_factory = sessionmaker(bind=engine)

    session = session_factory()
    user = User(email="owner@example.com", hashed_password="not-used-in-tests")
    session.add(user)
    session.flush()
    session.add(
        Workspace(
            id=TEST_WORKSPACE_ID,
            name="Test workspace",
            user_id=user.id,
        )
    )
    session.commit()
    session.close()

    yield session_factory

    Base.metadata.drop_all(engine)
    engine.dispose()


@pytest.fixture()
def client(db_session_factory: sessionmaker[Session]) -> Generator[TestClient, None, None]:
    """Configure the application to use the isolated test database."""
    def get_test_db() -> Generator[Session, None, None]:
        session = db_session_factory()
        try:
            yield session
        finally:
            session.close()

    main.app.dependency_overrides[get_db_session] = get_test_db
    with TestClient(main.app) as test_client:
        yield test_client
    main.app.dependency_overrides.clear()


def mock_orchestrator(
    monkeypatch: pytest.MonkeyPatch,
    insight: MeetingInsight,
) -> None:
    """Replace Gemini calls with deterministic transcript and insight data."""
    class FakeOrchestrator:
        def detect_and_parse(self, raw_transcript: str) -> list[TranscriptSegment]:
            return [
                TranscriptSegment(
                    speaker="Ana",
                    text="We will ship next week.",
                    timestamp_start="00:00:01",
                )
            ]

        def summarize_transcript(self, raw_transcript: str) -> MeetingInsight:
            return insight

    monkeypatch.setattr(main, "TranscriptOrchestrator", FakeOrchestrator)


def test_frontend_page_is_served(client: TestClient) -> None:
    response = client.get("/")

    assert response.status_code == 200
    assert "New meeting" in response.text
    assert 'id="duration"' in response.text


def test_summarize_meeting_persists_insights(
    client: TestClient,
    db_session_factory: sessionmaker[Session],
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    mock_orchestrator(
        monkeypatch,
        MeetingInsight(
            summary="The team agreed to ship next week.",
            decisions="Ship the release next week.",
            action_items=[
                ExtractedActionItem(
                    action_item="Prepare release notes.",
                    responsible_person="Ana",
                )
            ],
        ),
    )

    response = client.post(
        "/meetings/summarize",
        json={
            "raw_transcript": "Ana: We will ship next week.",
            "title": "Release planning",
            "meeting_start": "2026-07-20T09:00:00Z",
            "meeting_end": "2026-07-20T09:30:00Z",
        },
    )

    assert response.status_code == 200
    meeting_id = response.json()["meeting_id"]

    session = db_session_factory()
    try:
        meeting = session.get(Meeting, meeting_id)
        assert meeting is not None
        assert meeting.summary == "The team agreed to ship next week."
        assert meeting.scheduled_started_at.replace(tzinfo=timezone.utc) == datetime(
            2026,
            7,
            20,
            9,
            tzinfo=timezone.utc,
        )
        assert len(meeting.child_transcripts) == 1
        assert len(meeting.action_items) == 1
        assert meeting.action_items[0].content == "Prepare release notes."
        assert meeting.action_items[0].assignee.name == "Ana"
    finally:
        session.close()


def test_summarize_meeting_matches_assignees_within_workspace(
    client: TestClient,
    db_session_factory: sessionmaker[Session],
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    session = db_session_factory()
    try:
        user = User(email="other-owner@example.com", hashed_password="not-used-in-tests")
        session.add(user)
        session.flush()
        other_workspace = Workspace(name="Other workspace", user_id=user.id)
        session.add(other_workspace)
        session.flush()
        person_in_other_workspace = Person(
            name="Ana",
            workspace_id=other_workspace.id,
        )
        session.add(person_in_other_workspace)
        session.commit()
        person_in_other_workspace_id = person_in_other_workspace.id
    finally:
        session.close()

    mock_orchestrator(
        monkeypatch,
        MeetingInsight(
            summary="Summary",
            decisions="Decision",
            action_items=[
                ExtractedActionItem(
                    action_item="Prepare release notes.",
                    responsible_person="Ana",
                )
            ],
        ),
    )

    response = client.post(
        "/meetings/summarize",
        json={"raw_transcript": "Ana: I will prepare the release notes."},
    )

    assert response.status_code == 200
    session = db_session_factory()
    try:
        action_item = session.query(ActionItem).one()
        assert action_item.assignee_id != person_in_other_workspace_id
        assert action_item.assignee.workspace_id == TEST_WORKSPACE_ID
    finally:
        session.close()


def test_summarize_meeting_rolls_back_when_persistence_fails(
    client: TestClient,
    db_session_factory: sessionmaker[Session],
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    mock_orchestrator(
        monkeypatch,
        MeetingInsight(
            summary="Summary",
            decisions="Decision",
            action_items=[ExtractedActionItem(action_item="Prepare release notes.")],
        ),
    )

    def failing_action_item(**kwargs: object) -> None:
        raise RuntimeError("database write failed")

    monkeypatch.setattr(main, "ActionItem", failing_action_item)

    response = client.post(
        "/meetings/summarize",
        json={"raw_transcript": "Ana: I will prepare the release notes."},
    )

    assert response.status_code == 500
    assert response.json() == {
        "detail": "Unable to summarize and save the meeting."
    }

    session = db_session_factory()
    try:
        assert session.query(Meeting).count() == 0
        assert session.query(ActionItem).count() == 0
    finally:
        session.close()
