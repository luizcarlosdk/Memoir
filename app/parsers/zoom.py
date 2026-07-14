from app.parsers.base import BaseTranscriptParser, TranscriptSegment
import re


class ZoomParser(BaseTranscriptParser):
    def can_parse(self, raw_transcript: str) -> bool:
        is_valid = re.search(r"\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2} - ", raw_transcript)
        return bool(is_valid)

    def parse(self, raw_transcript: str) -> list[TranscriptSegment]:
        segments = []

        for line in raw_transcript.splitlines():
            match = re.match(
                r"(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}) - ([^:]+): (.+)", line
            )
            if match:
                timestamp, speaker, text = match.groups()
                segments.append(
                    TranscriptSegment(
                        speaker=speaker,
                        text=text,
                        timestamp_start=timestamp,
                        timestamp_end=None,
                    ),
                )

        return segments
