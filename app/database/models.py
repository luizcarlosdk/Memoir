import uuid

from sqlalchemy import (
    Column,
    DateTime,
    DeclarativeBase,
    Engine,
    ForeignKey,
    String,
    Table,
    Text,
    func,
)
from sqlalchemy.orm import Mapped, declared_attr, mapped_column, relationship


class Base(DeclarativeBase):
    """Base class for all SQLAlchemy models declarative models.

    This class serves as the foundational registry for the declarative mapping
    hierarchy. All database models should inherit from this class.
    """


class BaseMixin:
    """Mixin class providing audit timestamps columns.

    Adds 'created_at' and 'updated_at' columns to the inheriting model, allowing for
    automatic tracking of creation and modification times.
    """

    @declared_attr
    def created_at(cls) -> Mapped[DateTime]:
        return mapped_column(
            DateTime(timezone=True),
            server_default=func.now(),
            nullable=False,
        )

    @declared_attr
    def updated_at(cls) -> Mapped[DateTime]:
        return mapped_column(
            DateTime(timezone=True),
            server_default=func.now(),
            onupdate=func.now(),
            nullable=False,
        )


class UUIDMixin:
    """Mixin class for models that require a UUID primary key."""

    id: Mapped[str] = mapped_column(
        primary_key=True,
        nullable=False,
        default=lambda: str(uuid.uuid4()),
    )


# Association table for many-to-many relationship between Meeting and Person
meeting_participants = Table(
    "meeting_participants",
    Base.metadata,
    Column("meeting_id", String, ForeignKey("meetings.id"), primary_key=True),
    Column("person_id", String, ForeignKey("persons.id"), primary_key=True),
)


class Meeting(Base, UUIDMixin, BaseMixin):
    """Model representing a meeting entry in the database.

    Maps to the 'meetings' table
    """

    __tablename__ = "meetings"

    title: Mapped[str] = mapped_column(String)
    description: Mapped[str] = mapped_column(String, nullable=True)
    platform: Mapped[str] = mapped_column(String, nullable=True)

    scheduled_started_at: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )
    scheduled_ended_at: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    workspace_id: Mapped[str] = mapped_column(
        String,
        ForeignKey("workspaces.id"),
        nullable=False,
    )

    # --- Ai generated Content
    summary: Mapped[str | None] = mapped_column(Text, nullable=True)
    decisions: Mapped[str | None] = mapped_column(Text, nullable=True)

    raw_ai_response: Mapped[str | None] = mapped_column(Text, nullable=True)

    participants: Mapped[list["Person"]] = relationship(
        "Person",
        secondary="meeting_participants",
        back_populates="meetings",
    )

    child_transcripts: Mapped[list["Transcript"]] = relationship(
        "Transcript",
        back_populates="parent_meeting",
        cascade="all, delete-orphan",
    )

    action_items: Mapped[list["ActionItem"]] = relationship(
        "ActionItem",
        back_populates="parent_meeting",
    )

    def __repr__(self) -> str:
        """Return a string representation of the Meeting instance."""
        return f"<Meeting(id={self.id}, title={self.title}, description={self.description})>"


class Transcript(Base, UUIDMixin, BaseMixin):
    """Model representing a transcript entry in the database.

    Maps to the 'transcripts' table
    """

    __tablename__ = "transcripts"

    speaker: Mapped[str] = mapped_column(String)
    text: Mapped[str] = mapped_column(String)
    timestamp_start: Mapped[str] = mapped_column(String, nullable=True)
    timestamp_end: Mapped[str] = mapped_column(String, nullable=True)

    meeting_id: Mapped[str] = mapped_column(
        String,
        ForeignKey("meetings.id"),
        nullable=False,
    )

    parent_meeting: Mapped["Meeting"] = relationship(
        "Meeting",
        back_populates="child_transcripts",
    )

    def __repr__(self) -> str:
        return f"<Transcript(id={self.id}, speaker={self.speaker}, text={self.text})>"


class Person(Base, UUIDMixin, BaseMixin):
    """Model representing a person entry in the database, which can be associated with meetings and transcripts.

    Maps to "Person" table
    """

    __tablename__ = "persons"

    name: Mapped[str] = mapped_column(String)
    email: Mapped[str] = mapped_column(String, nullable=True)
    phone_number: Mapped[str] = mapped_column(String, nullable=True)
    workspace_id: Mapped[str] = mapped_column(
        String,
        ForeignKey("workspaces.id"),
        nullable=False,
    )

    meetings: Mapped[list["Meeting"]] = relationship(
        "Meeting",
        secondary="meeting_participants",
        back_populates="participants",
    )

    assigned_actions: Mapped[list["ActionItem"]] = relationship(
        "ActionItem",
        back_populates="assignee",
    )

    def __repr__(self) -> str:
        """Return a string representation of the Person instance."""
        return f"<Person(id={self.id}, name={self.name}, email={self.email}, phone_number={self.phone_number})>"


class ActionItem(Base, UUIDMixin, BaseMixin):
    """Model representing an action item entry in the database.

    Maps to the 'action_items' table
    """

    __tablename__ = "action_items"

    meeting_id: Mapped[str] = mapped_column(
        String,
        ForeignKey("meetings.id"),
        nullable=False,
    )

    assignee_id: Mapped[str | None] = mapped_column(
        String,
        ForeignKey("persons.id"),
        nullable=True,
    )

    assignee: Mapped["Person" | None] = relationship(
        "Person", back_populates="assigned_actions"
    )

    content: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(String, default="PENDING", nullable=False)
    due_date: Mapped[DateTime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    parent_meeting: Mapped["Meeting"] = relationship(
        "Meeting",
        back_populates="action_items",
    )

    def __repr__(self) -> str:
        return f"<ActionItem(id={self.id}, meeting_id={self.meeting_id}, assignee={self.assignee}, content={self.content}, status={self.status}, due_date={self.due_date})>"


class User(Base, UUIDMixin, BaseMixin):
    """Model representing a user entry in the database.

    Maps to the 'users' table
    """

    __tablename__ = "users"

    email: Mapped[str] = mapped_column(String, unique=True, nullable=False, index=True)
    hashed_password: Mapped[str] = mapped_column(String, nullable=False)

    workspaces: Mapped[list["Workspace"]] = relationship(
        "Workspace",
        back_populates="user",
        cascade="all, delete-orphan",
    )

    def __repr__(self) -> str:
        return f"<User(id={self.id}, email={self.email})>"


class Workspace(Base, UUIDMixin, BaseMixin):
    """Model representing a workspace entry in the database.

    Maps to the 'workspaces' table
    """

    __tablename__ = "workspaces"

    name: Mapped[str] = mapped_column(String, nullable=False)
    user_id: Mapped[str] = mapped_column(
        String,
        ForeignKey("users.id"),
        nullable=False,
    )

    user: Mapped["User"] = relationship(
        "User",
        back_populates="workspaces",
    )

    def __repr__(self) -> str:
        return f"<Workspace(id={self.id}, name={self.name}, user_id={self.user_id})>"
