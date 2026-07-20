import logging
from datetime import datetime

from dotenv import load_dotenv
from fastapi import Depends, FastAPI, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database.connection import get_db_session
from app.database.models import ActionItem, Meeting, Person, Transcript
from app.orchestrator import TranscriptOrchestrator

load_dotenv()

app = FastAPI(title="Memoir API")
logger = logging.getLogger(__name__)


class TranscriptUpload(BaseModel):
    raw_transcript: str
    title: str = "Untitled Meeting"
    meeting_start: datetime | None = None
    meeting_end: datetime | None = None
    workspace_id: str | None = "1"


@app.post("/meetings/summarize")
def summarize_meeting(payload: TranscriptUpload, db: Session = Depends(get_db_session)):
    try:
        orchestrator = TranscriptOrchestrator()
        segments = orchestrator.detect_and_parse(payload.raw_transcript)
        meeting_insight = orchestrator.summarize_transcript(payload.raw_transcript)

        new_meeting = Meeting(
            title=payload.title,
            scheduled_started_at=payload.meeting_start,
            scheduled_ended_at=payload.meeting_end,
            workspace_id=payload.workspace_id,
        )
        db.add(new_meeting)
        db.flush()  # Ensure the new meeting gets an ID

        new_meeting.summary = meeting_insight.summary
        new_meeting.decisions = meeting_insight.decisions

        for segment in segments:
            transcript_entry = Transcript(
                meeting_id=new_meeting.id,
                speaker=segment.speaker,
                text=segment.text,
                timestamp_start=segment.timestamp_start,
                timestamp_end=segment.timestamp_end,
                parent_meeting=new_meeting,
            )
            db.add(transcript_entry)

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
                    db.flush()  # Ensure the new person gets an ID
                    db_assignee_id = new_assignee.id

            action_item_entry = ActionItem(
                meeting_id=new_meeting.id,
                content=item.action_item,
                assignee_id=db_assignee_id,
                parent_meeting=new_meeting,
            )
            db.add(action_item_entry)

        db.commit()
        db.refresh(new_meeting)
    except Exception as exc:
        db.rollback()
        logger.exception("Failed to summarize and save meeting")
        raise HTTPException(
            status_code=500, detail="Unable to summarize and save the meeting."
        ) from exc

    return {
        "status": "success",
        "meeting_id": new_meeting.id,
        "message": "Meeting insights extracted and saved successfully",
    }
