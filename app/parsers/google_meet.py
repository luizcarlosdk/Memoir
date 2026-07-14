from app.parsers import transcriptSegment, TranscriptParser


class GoogleMeetParser(TranscriptParser):
    def can_parse(self, transcript: str) -> bool:
        pass

    def parse(self, transcript: str) -> list[transcriptSegment]:
        parsed_transcript = []

        return parsed_transcript
