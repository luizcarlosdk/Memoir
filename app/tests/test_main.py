"""Endpoint tests for meeting summarization."""

from collections.abc import Generator
from datetime import datetime, timezone

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

import app.main as main
import app.routes as routes
from app.core.meeting_inteligence import ExtractedActionItem, MeetingInsight
from app.database.connection import get_db_session
from app.database.models import (
    ActionItem,
    ActionItemStatus,
    Base,
    Meeting,
    Person,
    Transcript,
    User,
    Workspace,
)
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

    monkeypatch.setattr(routes, "TranscriptOrchestrator", FakeOrchestrator)


def test_frontend_page_is_served(client: TestClient) -> None:
    response = client.get("/")

    assert response.status_code == 200
    assert "Meetings" in response.text
    assert "Upload transcript" in response.text
    assert 'id="duration"' in response.text
    assert response.text.count('class="nav-item') == 1
    assert '<span data-icon="calendar"></span><span>Meetings</span>' in response.text


def test_workspaces_are_available_for_switching(client: TestClient) -> None:
    response = client.get("/workspaces")

    assert response.status_code == 200
    assert response.json() == {
        "workspaces": [{"id": TEST_WORKSPACE_ID, "name": "Test workspace"}]
    }


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
    serialized_meeting = response.json()["meeting"]
    assert serialized_meeting["workspace_id"] == TEST_WORKSPACE_ID
    assert serialized_meeting["action_items"][0]["status"] == "PENDING"
    assert serialized_meeting["transcript"] == [
        {
            "person_id": serialized_meeting["transcript"][0]["person_id"],
            "speaker": "Ana",
            "text": "We will ship next week.",
            "timestamp_start": "00:00:01",
            "timestamp_end": None,
        }
    ]

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
        transcript = meeting.child_transcripts[0]
        assert transcript.person is not None
        assert transcript.person.name == "Ana"
        assert transcript.person in meeting.participants
        assert transcript in transcript.person.transcript_segments
        assert serialized_meeting["transcript"][0]["person_id"] == transcript.person.id
        assert len(meeting.action_items) == 1
        assert meeting.action_items[0].content == "Prepare release notes."
        assert meeting.action_items[0].status is ActionItemStatus.PENDING
        assert meeting.action_items[0].assignee.name == "Ana"
    finally:
        session.close()


def test_summarize_meeting_reuses_speaker_with_normalized_name(
    client: TestClient,
    db_session_factory: sessionmaker[Session],
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    session = db_session_factory()
    try:
        existing_person = Person(name="Ana Silva", workspace_id=TEST_WORKSPACE_ID)
        session.add(existing_person)
        session.commit()
        existing_person_id = existing_person.id
    finally:
        session.close()

    class FakeOrchestrator:
        def detect_and_parse(self, raw_transcript: str) -> list[TranscriptSegment]:
            return [
                TranscriptSegment(
                    speaker="  ANA   SILVA ",
                    text="I will prepare the release notes.",
                )
            ]

        def summarize_transcript(self, raw_transcript: str) -> MeetingInsight:
            return MeetingInsight(
                summary="Summary",
                decisions="Decision",
                action_items=[],
            )

    monkeypatch.setattr(routes, "TranscriptOrchestrator", FakeOrchestrator)

    response = client.post(
        "/meetings/summarize",
        json={"raw_transcript": "ANA SILVA: I will prepare the release notes."},
    )

    assert response.status_code == 200
    session = db_session_factory()
    try:
        assert session.query(Person).count() == 1
        transcript = session.query(Transcript).one()
        assert transcript.person_id == existing_person_id
        assert transcript.speaker == "  ANA   SILVA "
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


def test_list_meetings_filters_by_workspace(
    client: TestClient,
    db_session_factory: sessionmaker[Session],
) -> None:
    session = db_session_factory()
    try:
        user = User(email="second-owner@example.com", hashed_password="unused")
        session.add(user)
        session.flush()
        second_workspace = Workspace(name="Second workspace", user_id=user.id)
        session.add(second_workspace)
        session.flush()
        session.add_all(
            [
                Meeting(title="Visible meeting", workspace_id=TEST_WORKSPACE_ID),
                Meeting(title="Hidden meeting", workspace_id=second_workspace.id),
            ]
        )
        session.commit()
    finally:
        session.close()

    response = client.get(f"/meetings?workspace_id={TEST_WORKSPACE_ID}")

    assert response.status_code == 200
    assert [meeting["title"] for meeting in response.json()["meetings"]] == [
        "Visible meeting"
    ]


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

    monkeypatch.setattr(routes, "ActionItem", failing_action_item)

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
