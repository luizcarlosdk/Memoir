from app.parsers import TranscriptSegment, TranscriptParser


class ZoomParser(TranscriptParser):
    def can_parse(self, raw_transcript: str) -> bool:
        return True

    def parse(self, raw_transcript: str) -> list[TranscriptSegment]:
        segments = []

        return segments
