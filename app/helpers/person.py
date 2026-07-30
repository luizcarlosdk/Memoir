"""Helpers for working with people and speaker identities."""


def normalize_person_name(name: str) -> str:
    """Return a stable key for matching a speaker within a workspace."""
    return " ".join(name.split()).casefold()
