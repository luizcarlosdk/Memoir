"""Pytest coverage for TranscriptOrchestrator."""

import logging
from pathlib import Path
import os
import pytest

from app.orchestrator import TranscriptOrchestrator
from app.parsers.llm import LLMParser


FIXTURES_DIR = Path(__file__).resolve().parent / "app" / "tests"


def list_fixtures(pattern: str) -> list[Path]:
    return sorted(FIXTURES_DIR.glob(pattern))


def load_fixture(path: Path) -> str:
    return path.read_text(encoding="utf-8")


@pytest.fixture()
def orchestrator() -> TranscriptOrchestrator:
    return TranscriptOrchestrator()


@pytest.mark.parametrize("fixture_path", list_fixtures("zoom*.vtt"))
def test_zoom_parser(orchestrator: TranscriptOrchestrator, fixture_path: Path) -> None:
    segments = orchestrator.detect_and_parse(load_fixture(fixture_path))

    assert segments, f"Expected at least 1 segment for {fixture_path.name}, got 0"
    assert segments[0].speaker, (
        f"Expected speaker in first segment for {fixture_path.name}"
    )
    assert segments[0].timestamp_start, (
        f"Expected timestamp in first segment for {fixture_path.name}"
    )


@pytest.mark.parametrize("fixture_path", list_fixtures("googlemeet*.txt"))
def test_google_meet_parser(
    orchestrator: TranscriptOrchestrator, fixture_path: Path
) -> None:
    segments = orchestrator.detect_and_parse(load_fixture(fixture_path))

    assert segments, f"Expected at least 1 segment for {fixture_path.name}, got 0"
    assert segments[0].speaker, (
        f"Expected speaker in first segment for {fixture_path.name}"
    )
    assert segments[0].timestamp_start, (
        f"Expected timestamp in first segment for {fixture_path.name}"
    )


@pytest.mark.parametrize("fixture_path", list_fixtures("*"))
def test_all_mock_files_parse(
    orchestrator: TranscriptOrchestrator, fixture_path: Path
) -> None:
    segments = orchestrator.detect_and_parse(load_fixture(fixture_path))

    assert segments, f"Expected at least 1 segment for {fixture_path.name}, got 0"
    assert segments[0].speaker, (
        f"Expected speaker in first segment for {fixture_path.name}"
    )
    assert segments[0].timestamp_start, (
        f"Expected timestamp in first segment for {fixture_path.name}"
    )


def test_empty_transcript(orchestrator: TranscriptOrchestrator) -> None:
    segments = orchestrator.detect_and_parse("")

    assert segments == []


@pytest.mark.integration
def test_llm_parser_with_real_api(caplog) -> None:
    """Smoke test for the real Gemini-backed LLM parser.

    Run with: pytest -m integration test_orchestrator.py::test_llm_parser_with_real_api -s
    """
    caplog.set_level(logging.INFO)

    parser = LLMParser(
        api_key=os.getenv("GOOGLE_API_KEY"),
        model_name="gemini-3.1-flash-lite",
    )
    transcript = """
John: Hello everyone, welcome to the meeting.
Sarah: Thanks for having us. Let's get started.
John: Great. First item on the agenda is the Q3 report.
    """

    segments = parser.parse(transcript)

    assert segments, "Gemini did not return any structured segments"
    assert all(segment.speaker for segment in segments), (
        "Every segment must have a speaker"
    )
    assert all(segment.text for segment in segments), "Every segment must have text"

    speakers = {segment.speaker for segment in segments}
    assert "John" in speakers, f"Expected John in Gemini output, got {speakers}"
    assert "Sarah" in speakers, f"Expected Sarah in Gemini output, got {speakers}"
