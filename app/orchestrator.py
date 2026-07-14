from app.parsers import google_meet, zoom
from app.parsers.base import TranscriptParser, TranscriptSegment


class TranscriptOrchestrator:
    def __init__(self):
        self.parsers: list[TranscriptParser] = [
            google_meet.GoogleMeetParser(),
            zoom.ZoomParser(),
        ]

    def detect_and_parse(self, raw_transcript: str) -> list[TranscriptSegment]:
        for parser in self.parsers:
            if parser.can_parse(raw_transcript):
                return parser.parse(raw_transcript)
        raise ValueError("No suitable parser found for the provided transcript.")
