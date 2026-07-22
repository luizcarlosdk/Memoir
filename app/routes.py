import logging
from datetime import datetime
from typing import TypedDict

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session, selectinload

from app.database.connection import get_db_session
from app.database.models import ActionItem, Meeting, Person, Transcript, Workspace
from app.orchestrator import TranscriptOrchestrator

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
    speaker: str
    text: str
    timestamp_start: str | None
    timestamp_end: str | None


class ActionItemResponse(TypedDict):
    content: str
    assignee: str | None
    status: str
    due_date: str | None


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
    transcript: list[TranscriptResponse]
    action_items: list[ActionItemResponse]


class MeetingSummaryResponse(TypedDict):
    status: str
    meeting_id: str
    message: str
    meeting: MeetingResponse


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

        for segment in segments:
            db.add(
                Transcript(
                    meeting_id=new_meeting.id,
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
                person = (
                    db.query(Person)
                    .filter(
                        Person.name == item.responsible_person,
                        Person.workspace_id == new_meeting.workspace_id,
                    )
                    .first()
                )
                if person:
                    db_assignee_id = person.id
                else:
                    new_assignee = Person(
                        name=item.responsible_person,
                        workspace_id=new_meeting.workspace_id,
                    )
                    db.add(new_assignee)
                    db.flush()
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
        "transcript": [
            {
                "speaker": segment.speaker,
                "text": segment.text,
                "timestamp_start": segment.timestamp_start,
                "timestamp_end": segment.timestamp_end,
            }
            for segment in meeting.child_transcripts
        ],
        "action_items": [
            {
                "content": item.content,
                "assignee": item.assignee.name if item.assignee else None,
                "status": item.status,
                "due_date": item.due_date.isoformat() if item.due_date else None,
            }
            for item in meeting.action_items
        ],
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
