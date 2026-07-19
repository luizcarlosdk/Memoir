from dotenv import dotenv_values, find_dotenv

from app.parsers import google_meet, zoom, llm
from app.parsers.base import BaseTranscriptParser, TranscriptSegment
from app.core.meeting_inteligence import SummarizationService, MeetingInsight


class TranscriptOrchestrator:
    def __init__(self):
        env_config = dotenv_values(find_dotenv())

        self.parsers: list[BaseTranscriptParser] = [
            google_meet.GoogleMeetParser(),
            zoom.ZoomParser(),
            llm.LLMParser(
                api_key=env_config.get("GOOGLE_API_KEY"),
                model_name="gemini-3.1-flash-lite",
            ),
        ]

    def detect_and_parse(self, raw_transcript: str) -> list[TranscriptSegment]:
        if not raw_transcript.strip():
            return []

        for parser in self.parsers:
            if parser.can_parse(raw_transcript):
                return parser.parse(raw_transcript)
        raise ValueError("No suitable parser found for the provided transcript.")

    def summarize_transcript(self, raw_transcript: str) -> MeetingInsight:
        """Summarizes the meeting transcript and extracts insights using the SummarizationService."""
        env_config = dotenv_values(find_dotenv())
        api_key = env_config.get("GOOGLE_API_KEY")
        model_name = "gemini-3.1-flash-lite"

        summarization_service = SummarizationService(api_key=api_key, model=model_name)
        return summarization_service.summarize_meeting(raw_transcript)
