from app.parsers import TranscriptSegment, TranscriptParser


class GoogleMeetParser(TranscriptParser):
    def can_parse(self, raw_transcript: str) -> bool:
        return True

    def parse(self, transcript: str) -> list[TranscriptSegment]:
        segments = []

        return segments
