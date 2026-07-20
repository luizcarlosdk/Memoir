from dotenv import dotenv_values, find_dotenv

from app.core.meeting_inteligence import SummarizationService, MeetingInsight
from app.parsers import google_meet, llm, zoom
from app.parsers.base import BaseTranscriptParser, TranscriptSegment


class TranscriptOrchestrator:
    def __init__(self):
        env_config = dotenv_values(find_dotenv())

        self.api_key = env_config.get("GOOGLE_API_KEY")
        self.model_name = "gemini-3.1-flash-lite"
        self.parsers: list[BaseTranscriptParser] = [
            google_meet.GoogleMeetParser(),
            zoom.ZoomParser(),
        ]
        self.llm_parser: llm.LLMParser | None = None

    def detect_and_parse(self, raw_transcript: str) -> list[TranscriptSegment]:
        if not raw_transcript.strip():
            return []

        for parser in self.parsers:
            if parser.can_parse(raw_transcript):
                return parser.parse(raw_transcript)

        if self.llm_parser is None:
            self.llm_parser = llm.LLMParser(
                api_key=self.api_key,
                model_name=self.model_name,
            )
        return self.llm_parser.parse(raw_transcript)

    def summarize_transcript(self, raw_transcript: str) -> MeetingInsight:
        """Summarizes the meeting transcript and extracts insights using the SummarizationService."""
        summarization_service = SummarizationService(
            api_key=self.api_key,
            model=self.model_name,
        )
        return summarization_service.summarize_meeting(raw_transcript)
