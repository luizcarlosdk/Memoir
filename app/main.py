from datetime import time

from dotenv import load_dotenv
from fastapi import Depends, FastAPI, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.database.models import ActionItem, Meeting, Person, Transcript
from app.orchestrator import TranscriptOrchestrator

load_dotenv()

app = FastAPI(title="Memoir API")


class TranscriptUpload(BaseModel):
    raw_transcrip: str
    title: str = "Untitled Meeting"
    meeting_start: time | None = None
    meeting_end: time | None = None


@app.post("/meetings/summarize")
def summarize_meeting(payload: TranscriptUpload, db: Session = Depends(get_db)):

    new_meeting = Meeting(
        title=payload.title,
        scheduled_start_at=payload.meeting_start,
        scheduled_end_at=payload.meeting_end,
    )

    db.add(new_meeting)
    db.flush()  # Ensure the new meeting gets an ID
    try:
        orchestrator = TranscriptOrchestrator()
        segments = orchestrator.detect_and_parse(payload.raw_transcript)
        meeting_insight = orchestrator.summarize_transcript(payload.raw_transcrip)
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error processing transcript: {str(e)}"
        )

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
                db.query(Person).filter(Person.name == item.responsible_person).first()
            )
            if person:
                db_assignee_id = person.id
            else:
                new_assignee = Person(name=item.responsible_person)
                db.add(new_assignee)
                db.flush()  # Ensure the new person gets an ID
                db_assignee_id = new_assignee.id

        action_item_entry = ActionItem(
            meeting_id=new_meeting.id,
            content=item.description,
            assignee_id=db_assignee_id,
            due_date=item.due_date,
            parent_meeting=new_meeting,
        )
        db.add(action_item_entry)

    db.commit()
    db.refresh(new_meeting)

    return {
        "status": "success",
        "meeting_id": new_meeting.id,
        "message": "Meeting insights extracted and saved succesfuly",
    }
