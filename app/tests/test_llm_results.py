"""Regression tests for Pydantic AI structured output handling."""

from app.core.meeting_inteligence import (
    ExtractedActionItem,
    MeetingInsight,
    SummarizationService,
)
from app.parsers.llm import LLMParser, ParsedTranscriptSegment


class FakeAgentResult:
    def __init__(self, output: object):
        self.output = output


class FakeAgent:
    def __init__(self, output: object):
        self.output = output

    def run_sync(self, prompt: str) -> FakeAgentResult:
        return FakeAgentResult(self.output)


def test_summarization_service_returns_agent_output() -> None:
    expected_insight = MeetingInsight(
        summary="Summary",
        decisions="Decision",
        action_items=[ExtractedActionItem(action_item="Follow up")],
    )
    service = object.__new__(SummarizationService)
    service.agent = FakeAgent(expected_insight)

    assert service.summarize_meeting("Transcript") == expected_insight


def test_llm_parser_converts_agent_output_to_transcript_segments() -> None:
    parser = object.__new__(LLMParser)
    parser.agent = FakeAgent(
        [
            ParsedTranscriptSegment(
                speaker="Ana",
                text="I will follow up.",
                timestamp_start="00:00:01",
            )
        ]
    )

    segments = parser.parse("Ana: I will follow up.")

    assert len(segments) == 1
    assert segments[0].speaker == "Ana"
    assert segments[0].text == "I will follow up."
