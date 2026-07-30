"""Build the cross-meeting activity overview for a person."""

from datetime import datetime
from typing import TypedDict

from sqlalchemy import and_, func, or_, select
from sqlalchemy.orm import Session, selectinload

from app.database.models import (
    ActionItem,
    ActionItemStatus,
    Meeting,
    Person,
    Transcript,
    meeting_participants,
)


class PersonIdentityResponse(TypedDict):
    id: str
    workspace_id: str
    name: str
    email: str | None
    phone_number: str | None


class PersonStatsResponse(TypedDict):
    meeting_count: int
    contribution_count: int
    open_action_item_count: int
    finished_action_item_count: int
    last_participated_at: str | None


class PersonMeetingResponse(TypedDict):
    id: str
    title: str
    scheduled_started_at: str | None
    summary: str | None
    contribution_count: int
    contribution_preview: list[str]


class ActionItemMeetingResponse(TypedDict):
    id: str
    title: str


class PersonActionItemResponse(TypedDict):
    id: str
    assignee_id: str | None
    content: str
    status: str
    due_date: str | None
    meeting: ActionItemMeetingResponse


class PersonInsightResponse(TypedDict):
    person: PersonIdentityResponse
    stats: PersonStatsResponse
    recent_meetings: list[PersonMeetingResponse]
    assigned_action_items: list[PersonActionItemResponse]


class PersonMeetingPageResponse(TypedDict):
    items: list[PersonMeetingResponse]
    total: int
    limit: int
    offset: int


class ContributionMeetingResponse(TypedDict):
    id: str
    title: str
    scheduled_started_at: str | None


class PersonContributionResponse(TypedDict):
    id: str
    speaker: str
    text: str
    timestamp_start: str | None
    timestamp_end: str | None
    meeting: ContributionMeetingResponse


class PersonContributionPageResponse(TypedDict):
    items: list[PersonContributionResponse]
    total: int
    limit: int
    offset: int


class PersonActionItemPageResponse(TypedDict):
    items: list[PersonActionItemResponse]
    total: int
    limit: int
    offset: int


class PersonDirectoryEntryResponse(TypedDict):
    id: str
    name: str
    email: str | None
    meeting_count: int
    contribution_count: int
    open_action_item_count: int
    last_participated_at: str | None


class PersonDirectoryPageResponse(TypedDict):
    items: list[PersonDirectoryEntryResponse]
    total: int
    limit: int
    offset: int


def _find_person(
    db: Session,
    *,
    person_id: str,
    workspace_id: str | None,
) -> Person | None:
    person_query = db.query(Person).filter(Person.id == person_id)
    if workspace_id:
        person_query = person_query.filter(Person.workspace_id == workspace_id)
    return person_query.first()


def _meeting_activity_at():
    return func.coalesce(Meeting.scheduled_started_at, Meeting.created_at)


def _get_meeting_rows(
    db: Session,
    *,
    person_id: str,
    limit: int,
    offset: int = 0,
) -> list[tuple[Meeting, int]]:
    return (
        db.query(
            Meeting,
            func.count(Transcript.id).label("contribution_count"),
        )
        .join(
            meeting_participants,
            meeting_participants.c.meeting_id == Meeting.id,
        )
        .outerjoin(
            Transcript,
            and_(
                Transcript.meeting_id == Meeting.id,
                Transcript.person_id == person_id,
            ),
        )
        .filter(meeting_participants.c.person_id == person_id)
        .group_by(Meeting.id)
        .order_by(_meeting_activity_at().desc())
        .offset(offset)
        .limit(limit)
        .all()
    )


def _get_contribution_previews(
    db: Session,
    *,
    person_id: str,
    meeting_ids: list[str],
) -> dict[str, list[str]]:
    previews_by_meeting = {meeting_id: [] for meeting_id in meeting_ids}
    if not meeting_ids:
        return previews_by_meeting

    ranked_contributions = (
        db.query(
            Transcript.meeting_id.label("meeting_id"),
            Transcript.text.label("text"),
            func.row_number()
            .over(
                partition_by=Transcript.meeting_id,
                order_by=(Transcript.created_at.asc(), Transcript.id.asc()),
            )
            .label("position"),
        )
        .filter(Transcript.person_id == person_id)
        .subquery()
    )
    preview_rows = (
        db.query(
            ranked_contributions.c.meeting_id,
            ranked_contributions.c.text,
        )
        .filter(
            ranked_contributions.c.meeting_id.in_(meeting_ids),
            ranked_contributions.c.position <= 2,
        )
        .order_by(
            ranked_contributions.c.meeting_id,
            ranked_contributions.c.position,
        )
        .all()
    )
    for meeting_id, text in preview_rows:
        previews_by_meeting[meeting_id].append(text)
    return previews_by_meeting


def _serialize_meeting_rows(
    meeting_rows: list[tuple[Meeting, int]],
    previews_by_meeting: dict[str, list[str]],
) -> list[PersonMeetingResponse]:
    return [
        {
            "id": meeting.id,
            "title": meeting.title,
            "scheduled_started_at": meeting.scheduled_started_at.isoformat()
            if meeting.scheduled_started_at
            else None,
            "summary": meeting.summary,
            "contribution_count": contribution_count,
            "contribution_preview": previews_by_meeting[meeting.id],
        }
        for meeting, contribution_count in meeting_rows
    ]


def serialize_person_action_item(item: ActionItem) -> PersonActionItemResponse:
    return {
        "id": item.id,
        "assignee_id": item.assignee_id,
        "content": item.content,
        "status": item.status.value,
        "due_date": item.due_date.isoformat() if item.due_date else None,
        "meeting": {
            "id": item.parent_meeting.id,
            "title": item.parent_meeting.title,
        },
    }


def list_people(
    db: Session,
    *,
    workspace_id: str | None,
    query_text: str | None,
    limit: int,
    offset: int,
) -> PersonDirectoryPageResponse:
    """Return a searchable page of people and their activity counts."""
    meeting_count = (
        select(func.count(meeting_participants.c.meeting_id))
        .where(meeting_participants.c.person_id == Person.id)
        .correlate(Person)
        .scalar_subquery()
    )
    contribution_count = (
        select(func.count(Transcript.id))
        .where(Transcript.person_id == Person.id)
        .correlate(Person)
        .scalar_subquery()
    )
    open_action_item_count = (
        select(func.count(ActionItem.id))
        .where(
            ActionItem.assignee_id == Person.id,
            ActionItem.status.in_(
                [
                    ActionItemStatus.PENDING,
                    ActionItemStatus.IN_PROGRESS,
                    ActionItemStatus.BLOCKED,
                ]
            ),
        )
        .correlate(Person)
        .scalar_subquery()
    )
    last_participated_at = (
        select(func.max(_meeting_activity_at()))
        .select_from(Meeting)
        .join(
            meeting_participants,
            meeting_participants.c.meeting_id == Meeting.id,
        )
        .where(meeting_participants.c.person_id == Person.id)
        .correlate(Person)
        .scalar_subquery()
    )

    people_query = db.query(
        Person,
        meeting_count.label("meeting_count"),
        contribution_count.label("contribution_count"),
        open_action_item_count.label("open_action_item_count"),
        last_participated_at.label("last_participated_at"),
    )
    if workspace_id:
        people_query = people_query.filter(Person.workspace_id == workspace_id)
    if query_text and query_text.strip():
        pattern = f"%{query_text.strip()}%"
        people_query = people_query.filter(
            or_(Person.name.ilike(pattern), Person.email.ilike(pattern))
        )

    total = people_query.count()
    rows = (
        people_query.order_by(func.lower(Person.name), Person.id)
        .offset(offset)
        .limit(limit)
        .all()
    )
    return {
        "items": [
            {
                "id": person.id,
                "name": person.name,
                "email": person.email,
                "meeting_count": meeting_total,
                "contribution_count": contribution_total,
                "open_action_item_count": open_action_total,
                "last_participated_at": last_activity.isoformat()
                if last_activity
                else None,
            }
            for (
                person,
                meeting_total,
                contribution_total,
                open_action_total,
                last_activity,
            ) in rows
        ],
        "total": total,
        "limit": limit,
        "offset": offset,
    }


def get_person_insight(
    db: Session,
    *,
    person_id: str,
    workspace_id: str | None = None,
) -> PersonInsightResponse | None:
    """Return a bounded overview of a person's meeting activity."""
    person = _find_person(
        db,
        person_id=person_id,
        workspace_id=workspace_id,
    )
    if person is None:
        return None

    meeting_count = (
        db.query(func.count(meeting_participants.c.meeting_id))
        .filter(meeting_participants.c.person_id == person.id)
        .scalar()
        or 0
    )
    contribution_count = (
        db.query(func.count(Transcript.id))
        .filter(Transcript.person_id == person.id)
        .scalar()
        or 0
    )
    open_action_item_count = (
        db.query(func.count(ActionItem.id))
        .filter(
            ActionItem.assignee_id == person.id,
            ActionItem.status.in_(
                [
                    ActionItemStatus.PENDING,
                    ActionItemStatus.IN_PROGRESS,
                    ActionItemStatus.BLOCKED,
                ]
            ),
        )
        .scalar()
        or 0
    )
    finished_action_item_count = (
        db.query(func.count(ActionItem.id))
        .filter(
            ActionItem.assignee_id == person.id,
            ActionItem.status == ActionItemStatus.FINISHED,
        )
        .scalar()
        or 0
    )

    meeting_rows = _get_meeting_rows(
        db,
        person_id=person.id,
        limit=10,
    )

    meeting_ids = [meeting.id for meeting, _ in meeting_rows]
    previews_by_meeting = _get_contribution_previews(
        db,
        person_id=person.id,
        meeting_ids=meeting_ids,
    )

    assigned_actions = (
        db.query(ActionItem)
        .options(selectinload(ActionItem.parent_meeting))
        .filter(ActionItem.assignee_id == person.id)
        .order_by(ActionItem.created_at.desc())
        .limit(20)
        .all()
    )

    last_participated_at = None
    if meeting_rows:
        latest_meeting = meeting_rows[0][0]
        last_participated_at = (
            latest_meeting.scheduled_started_at or latest_meeting.created_at
        )

    return {
        "person": {
            "id": person.id,
            "workspace_id": person.workspace_id,
            "name": person.name,
            "email": person.email,
            "phone_number": person.phone_number,
        },
        "stats": {
            "meeting_count": meeting_count,
            "contribution_count": contribution_count,
            "open_action_item_count": open_action_item_count,
            "finished_action_item_count": finished_action_item_count,
            "last_participated_at": last_participated_at.isoformat()
            if last_participated_at
            else None,
        },
        "recent_meetings": _serialize_meeting_rows(
            meeting_rows,
            previews_by_meeting,
        ),
        "assigned_action_items": [
            serialize_person_action_item(item) for item in assigned_actions
        ],
    }


def get_person_meetings(
    db: Session,
    *,
    person_id: str,
    workspace_id: str | None,
    limit: int,
    offset: int,
) -> PersonMeetingPageResponse | None:
    """Return a paginated list of meetings attended by a person."""
    person = _find_person(
        db,
        person_id=person_id,
        workspace_id=workspace_id,
    )
    if person is None:
        return None

    total = (
        db.query(func.count(meeting_participants.c.meeting_id))
        .filter(meeting_participants.c.person_id == person.id)
        .scalar()
        or 0
    )
    meeting_rows = _get_meeting_rows(
        db,
        person_id=person.id,
        limit=limit,
        offset=offset,
    )
    meeting_ids = [meeting.id for meeting, _ in meeting_rows]
    previews_by_meeting = _get_contribution_previews(
        db,
        person_id=person.id,
        meeting_ids=meeting_ids,
    )
    return {
        "items": _serialize_meeting_rows(meeting_rows, previews_by_meeting),
        "total": total,
        "limit": limit,
        "offset": offset,
    }


def get_person_contributions(
    db: Session,
    *,
    person_id: str,
    workspace_id: str | None,
    query_text: str | None,
    meeting_id: str | None,
    date_from: datetime | None,
    date_to: datetime | None,
    limit: int,
    offset: int,
) -> PersonContributionPageResponse | None:
    """Return searchable, paginated transcript contributions for a person."""
    person = _find_person(
        db,
        person_id=person_id,
        workspace_id=workspace_id,
    )
    if person is None:
        return None

    contribution_query = (
        db.query(Transcript, Meeting)
        .join(Meeting, Meeting.id == Transcript.meeting_id)
        .filter(Transcript.person_id == person.id)
    )
    if query_text:
        contribution_query = contribution_query.filter(
            Transcript.text.ilike(f"%{query_text.strip()}%")
        )
    if meeting_id:
        contribution_query = contribution_query.filter(
            Transcript.meeting_id == meeting_id
        )
    if date_from:
        contribution_query = contribution_query.filter(
            _meeting_activity_at() >= date_from
        )
    if date_to:
        contribution_query = contribution_query.filter(
            _meeting_activity_at() <= date_to
        )

    total = contribution_query.count()
    rows = (
        contribution_query.order_by(
            _meeting_activity_at().desc(),
            Transcript.created_at.asc(),
            Transcript.id.asc(),
        )
        .offset(offset)
        .limit(limit)
        .all()
    )
    return {
        "items": [
            {
                "id": transcript.id,
                "speaker": transcript.speaker,
                "text": transcript.text,
                "timestamp_start": transcript.timestamp_start,
                "timestamp_end": transcript.timestamp_end,
                "meeting": {
                    "id": meeting.id,
                    "title": meeting.title,
                    "scheduled_started_at": meeting.scheduled_started_at.isoformat()
                    if meeting.scheduled_started_at
                    else None,
                },
            }
            for transcript, meeting in rows
        ],
        "total": total,
        "limit": limit,
        "offset": offset,
    }


def get_person_action_items(
    db: Session,
    *,
    person_id: str,
    workspace_id: str | None,
    status: ActionItemStatus | None,
    limit: int,
    offset: int,
) -> PersonActionItemPageResponse | None:
    """Return paginated action items assigned to a person."""
    person = _find_person(
        db,
        person_id=person_id,
        workspace_id=workspace_id,
    )
    if person is None:
        return None

    action_query = (
        db.query(ActionItem)
        .options(selectinload(ActionItem.parent_meeting))
        .filter(ActionItem.assignee_id == person.id)
    )
    if status:
        action_query = action_query.filter(ActionItem.status == status)

    total = action_query.count()
    action_items = (
        action_query.order_by(ActionItem.created_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )
    return {
        "items": [serialize_person_action_item(item) for item in action_items],
        "total": total,
        "limit": limit,
        "offset": offset,
    }
