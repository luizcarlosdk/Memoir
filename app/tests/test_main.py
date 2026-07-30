"""Endpoint tests for meeting summarization."""

from collections.abc import Generator
from datetime import datetime, timezone

import pytest
from fastapi import HTTPException
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
    assert response.text.count('class="nav-item') == 2
    assert '<span data-icon="calendar"></span><span>Meetings</span>' in response.text
    assert '<span data-icon="people"></span><span>Persons</span>' in response.text
    assert 'id="people-list"' in response.text
    assert 'id="person-open-actions-filter"' in response.text
    assert 'id="person-sort"' in response.text
    assert 'id="action-status-backdrop"' in response.text

    script = client.get("/app.js")
    assert script.status_code == 200
    assert "/persons/${encodeURIComponent(personId)}/meetings" in script.text
    assert "/persons/${encodeURIComponent(personId)}/contributions" in script.text
    assert "/persons/${encodeURIComponent(personId)}/action-items" in script.text
    assert "openPersonActionStatusEditor(item, row)" in script.text
    assert "openActionStatusEditor(item, row" in script.text
    assert "/action-items/${encodeURIComponent(actionItemId)}" in script.text
    assert 'method: "PATCH"' in script.text
    assert "showAllMeetings: false" in script.text
    assert "setAllMeetingsExpanded(!state.showAllMeetings)" in script.text
    assert 'create("ul", "person-todo-list")' in script.text
    assert "loadMeetings(body.meeting_id),\n      loadPersons()," in script.text


def test_workspaces_are_available_for_switching(client: TestClient) -> None:
    response = client.get("/workspaces")

    assert response.status_code == 200
    assert response.json() == {
        "workspaces": [{"id": TEST_WORKSPACE_ID, "name": "Test workspace"}]
    }


def test_retrieve_person_insight_returns_activity_overview(
    client: TestClient,
    db_session_factory: sessionmaker[Session],
) -> None:
    session = db_session_factory()
    try:
        person = Person(
            name="Ana Silva",
            email="ana@example.com",
            workspace_id=TEST_WORKSPACE_ID,
        )
        meeting = Meeting(
            title="Release planning",
            summary="The team prepared the release.",
            scheduled_started_at=datetime(2026, 7, 20, 9, tzinfo=timezone.utc),
            workspace_id=TEST_WORKSPACE_ID,
            participants=[person],
        )
        session.add_all([person, meeting])
        session.flush()
        session.add_all(
            [
                Transcript(
                    speaker="Ana Silva",
                    text="We should ship next week.",
                    meeting_id=meeting.id,
                    person_id=person.id,
                    created_at=datetime(2026, 7, 20, 9, 1, tzinfo=timezone.utc),
                ),
                Transcript(
                    speaker="Ana Silva",
                    text="I will prepare the release notes.",
                    meeting_id=meeting.id,
                    person_id=person.id,
                    created_at=datetime(2026, 7, 20, 9, 2, tzinfo=timezone.utc),
                ),
                ActionItem(
                    meeting_id=meeting.id,
                    assignee_id=person.id,
                    content="Prepare release notes.",
                ),
                ActionItem(
                    meeting_id=meeting.id,
                    assignee_id=person.id,
                    content="Confirm the release date.",
                    status=ActionItemStatus.FINISHED,
                ),
            ]
        )
        session.commit()
        person_id = person.id
        meeting_id = meeting.id
    finally:
        session.close()

    response = client.get(
        f"/persons/{person_id}?workspace_id={TEST_WORKSPACE_ID}"
    )

    assert response.status_code == 200
    insight = response.json()
    assert insight["person"] == {
        "id": person_id,
        "workspace_id": TEST_WORKSPACE_ID,
        "name": "Ana Silva",
        "email": "ana@example.com",
        "phone_number": None,
    }
    assert insight["stats"] == {
        "meeting_count": 1,
        "contribution_count": 2,
        "open_action_item_count": 1,
        "finished_action_item_count": 1,
        "last_participated_at": "2026-07-20T09:00:00",
    }
    assert insight["recent_meetings"] == [
        {
            "id": meeting_id,
            "title": "Release planning",
            "scheduled_started_at": "2026-07-20T09:00:00",
            "summary": "The team prepared the release.",
            "contribution_count": 2,
            "contribution_preview": [
                "We should ship next week.",
                "I will prepare the release notes.",
            ],
        }
    ]
    assert {item["status"] for item in insight["assigned_action_items"]} == {
        "PENDING",
        "FINISHED",
    }
    assert all(
        item["meeting"] == {"id": meeting_id, "title": "Release planning"}
        for item in insight["assigned_action_items"]
    )

    directory_response = client.get(
        "/persons",
        params={"workspace_id": TEST_WORKSPACE_ID, "query": "ana"},
    )
    assert directory_response.status_code == 200
    assert directory_response.json() == {
        "items": [
            {
                "id": person_id,
                "name": "Ana Silva",
                "email": "ana@example.com",
                "meeting_count": 1,
                "contribution_count": 2,
                "open_action_item_count": 1,
                "last_participated_at": "2026-07-20T09:00:00",
            }
        ],
        "total": 1,
        "limit": 50,
        "offset": 0,
    }

    meetings_response = client.get(
        f"/persons/{person_id}/meetings?limit=1&offset=0"
    )
    assert meetings_response.status_code == 200
    assert meetings_response.json() == {
        "items": insight["recent_meetings"],
        "total": 1,
        "limit": 1,
        "offset": 0,
    }

    contributions_response = client.get(
        f"/persons/{person_id}/contributions",
        params={"query": "release notes", "limit": 1},
    )
    assert contributions_response.status_code == 200
    assert contributions_response.json() == {
        "items": [
            {
                "id": contributions_response.json()["items"][0]["id"],
                "speaker": "Ana Silva",
                "text": "I will prepare the release notes.",
                "timestamp_start": None,
                "timestamp_end": None,
                "meeting": {
                    "id": meeting_id,
                    "title": "Release planning",
                    "scheduled_started_at": "2026-07-20T09:00:00",
                },
            }
        ],
        "total": 1,
        "limit": 1,
        "offset": 0,
    }

    action_items_response = client.get(
        f"/persons/{person_id}/action-items",
        params={"status": "FINISHED"},
    )
    assert action_items_response.status_code == 200
    assert action_items_response.json()["total"] == 1
    assert action_items_response.json()["items"][0]["content"] == (
        "Confirm the release date."
    )
    assert action_items_response.json()["items"][0]["status"] == "FINISHED"


def test_plural_person_routes_are_documented(client: TestClient) -> None:
    paths = client.get("/openapi.json").json()["paths"]

    assert "/persons" in paths
    assert "/persons/{person_id}" in paths
    assert "/persons/{person_id}/meetings" in paths
    assert "/persons/{person_id}/contributions" in paths
    assert "/persons/{person_id}/action-items" in paths
    assert "/persons/{person_id}/action-items/{action_item_id}" in paths
    assert "/action-items/{action_item_id}" in paths
    assert "/person/{person_id}" not in paths


def test_update_action_item_status_routes(
    db_session_factory: sessionmaker[Session],
) -> None:
    session = db_session_factory()
    try:
        person = Person(name="Ana", workspace_id=TEST_WORKSPACE_ID)
        meeting = Meeting(
            title="Release planning",
            workspace_id=TEST_WORKSPACE_ID,
            participants=[person],
        )
        session.add_all([person, meeting])
        session.flush()
        action_item = ActionItem(
            meeting_id=meeting.id,
            assignee=person,
            content="Prepare release notes.",
            parent_meeting=meeting,
        )
        session.add(action_item)
        session.commit()
        person_id = person.id
        action_item_id = action_item.id
        meeting_id = meeting.id
        with pytest.raises(HTTPException) as exc_info:
            routes.update_person_action_item_status(
                person_id=person_id,
                action_item_id=action_item_id,
                payload=routes.ActionItemStatusUpdate(
                    status=ActionItemStatus.FINISHED
                ),
                workspace_id="another-workspace",
                db=session,
            )
        assert exc_info.value.status_code == 404

        response = routes.update_person_action_item_status(
            person_id=person_id,
            action_item_id=action_item_id,
            payload=routes.ActionItemStatusUpdate(
                status=ActionItemStatus.IN_PROGRESS
            ),
            workspace_id=TEST_WORKSPACE_ID,
            db=session,
        )

        assert response == {
            "id": action_item_id,
            "assignee_id": person_id,
            "content": "Prepare release notes.",
            "status": "IN_PROGRESS",
            "due_date": None,
            "meeting": {"id": meeting_id, "title": "Release planning"},
        }
        persisted_action_item = session.get(ActionItem, action_item_id)
        assert persisted_action_item is not None
        assert persisted_action_item.status is ActionItemStatus.IN_PROGRESS

        with pytest.raises(HTTPException) as exc_info:
            routes.update_action_item_status(
                action_item_id=action_item_id,
                payload=routes.ActionItemStatusUpdate(
                    status=ActionItemStatus.FINISHED
                ),
                workspace_id="another-workspace",
                db=session,
            )
        assert exc_info.value.status_code == 404

        meeting_response = routes.update_action_item_status(
            action_item_id=action_item_id,
            payload=routes.ActionItemStatusUpdate(
                status=ActionItemStatus.FINISHED
            ),
            workspace_id=TEST_WORKSPACE_ID,
            db=session,
        )
        assert meeting_response == {
            "id": action_item_id,
            "assignee_id": person_id,
            "content": "Prepare release notes.",
            "assignee": "Ana",
            "status": "FINISHED",
            "due_date": None,
        }

        unassigned_action = ActionItem(
            meeting_id=meeting_id,
            content="Publish the release notes.",
        )
        session.add(unassigned_action)
        session.commit()
        unassigned_response = routes.update_action_item_status(
            action_item_id=unassigned_action.id,
            payload=routes.ActionItemStatusUpdate(
                status=ActionItemStatus.BLOCKED
            ),
            workspace_id=TEST_WORKSPACE_ID,
            db=session,
        )
        assert unassigned_response["assignee_id"] is None
        assert unassigned_response["assignee"] is None
        assert unassigned_response["status"] == "BLOCKED"
    finally:
        session.close()


def test_retrieve_person_insight_respects_workspace(
    client: TestClient,
    db_session_factory: sessionmaker[Session],
) -> None:
    session = db_session_factory()
    try:
        person = Person(name="Ana", workspace_id=TEST_WORKSPACE_ID)
        session.add(person)
        session.commit()
        person_id = person.id
    finally:
        session.close()

    response = client.get(f"/persons/{person_id}?workspace_id=another-workspace")

    assert response.status_code == 404
    assert response.json() == {"detail": "Person not found"}


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
    assert serialized_meeting["participant_details"] == [
        {
            "id": serialized_meeting["transcript"][0]["person_id"],
            "name": "Ana",
        }
    ]
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
