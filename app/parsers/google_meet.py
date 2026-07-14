import re

from app.parsers.base import BaseTranscriptParser, TranscriptSegment


GOOGLE_MEET_LINE_PATTERN = re.compile(
    r"^\[(?P<timestamp>\d{2}:\d{2}:\d{2})\]\s+(?P<speaker>[^:]+):\s+(?P<text>.+)$"
)


class GoogleMeetParser(BaseTranscriptParser):
    def can_parse(self, raw_transcript: str) -> bool:
        return any(
            GOOGLE_MEET_LINE_PATTERN.fullmatch(line)
            for line in raw_transcript.splitlines()
        )

    def parse(self, raw_transcript: str) -> list[TranscriptSegment]:
        segments = []

        for line in raw_transcript.splitlines():
            match = GOOGLE_MEET_LINE_PATTERN.fullmatch(line)
            if match:
                timestamp = match.group("timestamp")
                speaker = match.group("speaker")
                text = match.group("text")
                segments.append(
                    TranscriptSegment(
                        speaker=speaker,
                        text=text,
                        timestamp_start=timestamp,
                        timestamp_end=None,
                    ),
                )

        return segments
