from app.parsers import google_meet, zoom, llm
from app.parsers.base import BaseTranscriptParser, TranscriptSegment


class TranscriptOrchestrator:
    def __init__(self, include_llm_fallback: bool = False):
        self.parsers: list[BaseTranscriptParser] = [
            google_meet.GoogleMeetParser(),
            zoom.ZoomParser(),
        ]
        if include_llm_fallback:
            self.parsers.append(llm.LLMParser())

    def detect_and_parse(self, raw_transcript: str) -> list[TranscriptSegment]:
        if not raw_transcript.strip():
            return []

        for parser in self.parsers:
            if parser.can_parse(raw_transcript):
                return parser.parse(raw_transcript)
        raise ValueError("No suitable parser found for the provided transcript.")
