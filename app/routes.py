import logging
from datetime import datetime
from typing import TypedDict

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session, selectinload

from app.database.connection import get_db_session
from app.database.models import (
    ActionItem,
    ActionItemStatus,
    Meeting,
    Person,
    Transcript,
    Workspace,
)
from app.helpers.person import normalize_person_name
from app.orchestrator import TranscriptOrchestrator
from app.services.person_insight import (
    PersonActionItemPageResponse,
    PersonActionItemResponse,
    PersonContributionPageResponse,
    PersonDirectoryPageResponse,
    PersonInsightResponse,
    PersonMeetingPageResponse,
    get_person_action_items,
    get_person_contributions,
    get_person_insight,
    get_person_meetings,
    list_people,
    serialize_person_action_item,
)

router = APIRouter()
logger = logging.getLogger(__name__)


class TranscriptUpload(BaseModel):
    raw_transcript: str
    title: str = "Untitled Meeting"
    description: str | None = None
    meeting_start: datetime | None = None
    meeting_end: datetime | None = None
    workspace_id: str | None = "1"


class TranscriptResponse(TypedDict):
    person_id: str | None
    speaker: str
    text: str
    timestamp_start: str | None
    timestamp_end: str | None


class ActionItemResponse(TypedDict):
    id: str
    assignee_id: str | None
    content: str
    assignee: str | None
    status: str
    due_date: str | None


class MeetingParticipantResponse(TypedDict):
    id: str
    name: str


class MeetingResponse(TypedDict):
    id: str
    workspace_id: str
    title: str
    description: str | None
    platform: str | None
    scheduled_started_at: str | None
    scheduled_ended_at: str | None
    summary: str | None
    decisions: str | None
    created_at: str | None
    participants: list[str]
    participant_details: list[MeetingParticipantResponse]
    transcript: list[TranscriptResponse]
    action_items: list[ActionItemResponse]


class MeetingSummaryResponse(TypedDict):
    status: str
    meeting_id: str
    message: str
    meeting: MeetingResponse


class ActionItemStatusUpdate(BaseModel):
    status: ActionItemStatus


class MeetingListResponse(TypedDict):
    meetings: list[MeetingResponse]


class WorkspaceResponse(TypedDict):
    id: str
    name: str


class WorkspaceListResponse(TypedDict):
    workspaces: list[WorkspaceResponse]


@router.post("/meetings/summarize")
def summarize_meeting(
    payload: TranscriptUpload,
    db: Session = Depends(get_db_session),
) -> MeetingSummaryResponse:
    try:
        orchestrator = TranscriptOrchestrator()
        segments = orchestrator.detect_and_parse(payload.raw_transcript)
        meeting_insight = orchestrator.summarize_transcript(payload.raw_transcript)

        new_meeting = Meeting(
            title=payload.title,
            description=payload.description,
            platform=getattr(orchestrator, "last_detected_platform", None),
            scheduled_started_at=payload.meeting_start,
            scheduled_ended_at=payload.meeting_end,
            workspace_id=payload.workspace_id,
        )
        db.add(new_meeting)
        db.flush()

        new_meeting.summary = meeting_insight.summary
        new_meeting.decisions = meeting_insight.decisions

        people_by_name = {
            normalize_person_name(person.name): person
            for person in db.query(Person)
            .filter(Person.workspace_id == new_meeting.workspace_id)
            .all()
        }

        for segment in segments:
            normalized_speaker = normalize_person_name(segment.speaker)
            person = people_by_name.get(normalized_speaker)
            if person is None:
                person = Person(
                    name=segment.speaker.strip(),
                    workspace_id=new_meeting.workspace_id,
                )
                db.add(person)
                db.flush()
                people_by_name[normalized_speaker] = person

            if person not in new_meeting.participants:
                new_meeting.participants.append(person)

            db.add(
                Transcript(
                    meeting_id=new_meeting.id,
                    person_id=person.id,
                    speaker=segment.speaker,
                    text=segment.text,
                    timestamp_start=segment.timestamp_start,
                    timestamp_end=segment.timestamp_end,
                    parent_meeting=new_meeting,
                )
            )

        for item in meeting_insight.action_items:
            db_assignee_id = None
            if item.responsible_person:
                normalized_assignee = normalize_person_name(item.responsible_person)
                person = people_by_name.get(normalized_assignee)
                if person:
                    db_assignee_id = person.id
                else:
                    new_assignee = Person(
                        name=item.responsible_person,
                        workspace_id=new_meeting.workspace_id,
                    )
                    db.add(new_assignee)
                    db.flush()
                    people_by_name[normalized_assignee] = new_assignee
                    db_assignee_id = new_assignee.id

            db.add(
                ActionItem(
                    meeting_id=new_meeting.id,
                    content=item.action_item,
                    assignee_id=db_assignee_id,
                    parent_meeting=new_meeting,
                )
            )

        db.commit()
        db.refresh(new_meeting)
    except Exception as exc:
        db.rollback()
        logger.exception("Failed to summarize and save meeting")
        raise HTTPException(
            status_code=500,
            detail="Unable to summarize and save the meeting.",
        ) from exc

    return {
        "status": "success",
        "meeting_id": new_meeting.id,
        "message": "Meeting insights extracted and saved successfully",
        "meeting": serialize_meeting(new_meeting),
    }


def serialize_meeting(meeting: Meeting) -> MeetingResponse:
    """Return meeting data needed by the summary interface."""
    return {
        "id": meeting.id,
        "workspace_id": meeting.workspace_id,
        "title": meeting.title,
        "description": meeting.description,
        "platform": meeting.platform,
        "scheduled_started_at": meeting.scheduled_started_at.isoformat()
        if meeting.scheduled_started_at
        else None,
        "scheduled_ended_at": meeting.scheduled_ended_at.isoformat()
        if meeting.scheduled_ended_at
        else None,
        "summary": meeting.summary,
        "decisions": meeting.decisions,
        "created_at": meeting.created_at.isoformat() if meeting.created_at else None,
        "participants": [person.name for person in meeting.participants],
        "participant_details": [
            {"id": person.id, "name": person.name}
            for person in meeting.participants
        ],
        "transcript": [
            {
                "person_id": segment.person_id,
                "speaker": segment.speaker,
                "text": segment.text,
                "timestamp_start": segment.timestamp_start,
                "timestamp_end": segment.timestamp_end,
            }
            for segment in meeting.child_transcripts
        ],
        "action_items": [serialize_action_item(item) for item in meeting.action_items],
    }


def serialize_action_item(item: ActionItem) -> ActionItemResponse:
    """Return an action item shape shared by Meeting views and updates."""
    return {
        "id": item.id,
        "assignee_id": item.assignee_id,
        "content": item.content,
        "assignee": item.assignee.name if item.assignee else None,
        "status": item.status.value,
        "due_date": item.due_date.isoformat() if item.due_date else None,
    }


@router.get("/meetings")
def list_recent_meetings(
    workspace_id: str | None = None,
    db: Session = Depends(get_db_session),
) -> MeetingListResponse:
    """Return the most recently created meetings."""
    query = db.query(Meeting)
    if workspace_id:
        query = query.filter(Meeting.workspace_id == workspace_id)
    meetings = (
        query.options(
            selectinload(Meeting.participants),
            selectinload(Meeting.child_transcripts),
            selectinload(Meeting.action_items).selectinload(ActionItem.assignee),
        )
        .order_by(Meeting.created_at.desc())
        .limit(50)
        .all()
    )
    return {"meetings": [serialize_meeting(meeting) for meeting in meetings]}


@router.get("/workspaces")
def list_workspaces(db: Session = Depends(get_db_session)) -> WorkspaceListResponse:
    """Return available workspaces for the unauthenticated workspace switcher."""
    workspaces = db.query(Workspace).order_by(Workspace.name.asc()).all()
    serialized: list[WorkspaceResponse] = [
        {"id": workspace.id, "name": workspace.name} for workspace in workspaces
    ]
    known_ids = {workspace["id"] for workspace in serialized}
    meeting_workspace_ids = (
        db.query(Meeting.workspace_id)
        .filter(Meeting.workspace_id.is_not(None))
        .distinct()
        .all()
    )
    for (workspace_id,) in meeting_workspace_ids:
        if workspace_id in known_ids:
            continue
        fallback_name = (
            "Default workspace"
            if workspace_id == "1"
            else f"Workspace {workspace_id[:8]}"
        )
        serialized.append({"id": workspace_id, "name": fallback_name})
    return {"workspaces": serialized}


@router.get("/persons/{person_id}")
def retrieve_person_insight(
    person_id: str,
    workspace_id: str | None = None,
    db: Session = Depends(get_db_session),
) -> PersonInsightResponse:
    insight = get_person_insight(
        db,
        person_id=person_id,
        workspace_id=workspace_id,
    )
    if insight is None:
        raise HTTPException(status_code=404, detail="Person not found")
    return insight


@router.get("/persons")
def retrieve_people(
    workspace_id: str | None = None,
    query: str | None = Query(default=None, max_length=200),
    limit: int = Query(default=50, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db_session),
) -> PersonDirectoryPageResponse:
    return list_people(
        db,
        workspace_id=workspace_id,
        query_text=query,
        limit=limit,
        offset=offset,
    )


@router.get("/persons/{person_id}/meetings")
def retrieve_person_meetings(
    person_id: str,
    workspace_id: str | None = None,
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db_session),
) -> PersonMeetingPageResponse:
    result = get_person_meetings(
        db,
        person_id=person_id,
        workspace_id=workspace_id,
        limit=limit,
        offset=offset,
    )
    if result is None:
        raise HTTPException(status_code=404, detail="Person not found")
    return result


@router.get("/persons/{person_id}/contributions")
def retrieve_person_contributions(
    person_id: str,
    workspace_id: str | None = None,
    query: str | None = Query(default=None, max_length=200),
    meeting_id: str | None = None,
    date_from: datetime | None = None,
    date_to: datetime | None = None,
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db_session),
) -> PersonContributionPageResponse:
    result = get_person_contributions(
        db,
        person_id=person_id,
        workspace_id=workspace_id,
        query_text=query,
        meeting_id=meeting_id,
        date_from=date_from,
        date_to=date_to,
        limit=limit,
        offset=offset,
    )
    if result is None:
        raise HTTPException(status_code=404, detail="Person not found")
    return result


@router.get("/persons/{person_id}/action-items")
def retrieve_person_action_items(
    person_id: str,
    workspace_id: str | None = None,
    status: ActionItemStatus | None = None,
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db_session),
) -> PersonActionItemPageResponse:
    result = get_person_action_items(
        db,
        person_id=person_id,
        workspace_id=workspace_id,
        status=status,
        limit=limit,
        offset=offset,
    )
    if result is None:
        raise HTTPException(status_code=404, detail="Person not found")
    return result


@router.patch("/persons/{person_id}/action-items/{action_item_id}")
def update_person_action_item_status(
    person_id: str,
    action_item_id: str,
    payload: ActionItemStatusUpdate,
    workspace_id: str | None = None,
    db: Session = Depends(get_db_session),
) -> PersonActionItemResponse:
    """Update the status of an action item assigned to a person."""
    action_query = (
        db.query(ActionItem)
        .join(Person, Person.id == ActionItem.assignee_id)
        .join(Meeting, Meeting.id == ActionItem.meeting_id)
        .options(selectinload(ActionItem.parent_meeting))
        .filter(
            ActionItem.id == action_item_id,
            ActionItem.assignee_id == person_id,
        )
    )
    if workspace_id:
        action_query = action_query.filter(
            Person.workspace_id == workspace_id,
            Meeting.workspace_id == workspace_id,
        )

    action_item = action_query.first()
    if action_item is None:
        raise HTTPException(status_code=404, detail="Action item not found")

    action_item.status = payload.status
    try:
        db.commit()
        db.refresh(action_item)
    except Exception as exc:
        db.rollback()
        logger.exception("Failed to update action item status")
        raise HTTPException(
            status_code=500,
            detail="Unable to update the action item status.",
        ) from exc

    return serialize_person_action_item(action_item)


@router.patch("/action-items/{action_item_id}")
def update_action_item_status(
    action_item_id: str,
    payload: ActionItemStatusUpdate,
    workspace_id: str | None = None,
    db: Session = Depends(get_db_session),
) -> ActionItemResponse:
    """Update an action item's status from a Meeting view."""
    action_query = (
        db.query(ActionItem)
        .join(Meeting, Meeting.id == ActionItem.meeting_id)
        .options(selectinload(ActionItem.assignee))
        .filter(ActionItem.id == action_item_id)
    )
    if workspace_id:
        action_query = action_query.filter(Meeting.workspace_id == workspace_id)

    action_item = action_query.first()
    if action_item is None:
        raise HTTPException(status_code=404, detail="Action item not found")

    action_item.status = payload.status
    try:
        db.commit()
        db.refresh(action_item)
    except Exception as exc:
        db.rollback()
        logger.exception("Failed to update action item status")
        raise HTTPException(
            status_code=500,
            detail="Unable to update the action item status.",
        ) from exc

    return serialize_action_item(action_item)
