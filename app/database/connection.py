from collections.abc import Generator
from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.database.models import Base

CURRENT_DIR = Path(__file__).resolve().parent
DATABASE_PATH = CURRENT_DIR / "memoir.db"
DATABASE_URL = f"sqlite:///{DATABASE_PATH}"

# Adicionado check_same_thread=False para evitar erros em frameworks web
engine = create_engine(
    DATABASE_URL,
    echo=True,
    connect_args={"check_same_thread": False},
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def init_db() -> None:
    """Initialize the database by creating all tables defined in the models."""
    Base.metadata.create_all(bind=engine)


def drop_db() -> None:
    """Drop all tables in the database."""
    Base.metadata.drop_all(bind=engine)


# Tipo corrigido de Session para Generator
def get_db_session() -> Generator[Session, None, None]:
    """Provide a database session for use in application code."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
