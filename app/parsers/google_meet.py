import re

from app.parsers.base import BaseTranscriptParser, TranscriptSegment


GOOGLE_MEET_LINE_PATTERN = re.compile(
    r"^(?P<speaker>[^:]+):\s*(?P<timestamp>\d{1,2}:\d{2}(?::\d{2})?)\s*$"
)


class GoogleMeetParser(BaseTranscriptParser):
    def can_parse(self, raw_transcript: str) -> bool:
        return any(
            GOOGLE_MEET_LINE_PATTERN.fullmatch(line)
            for line in raw_transcript.splitlines()
        )

    def parse(self, raw_transcript: str) -> list[TranscriptSegment]:
        segments = []
        current_speaker = None
        current_timestamp = None
        current_lines = []

        def flush_current_segment() -> None:
            if current_speaker is None or current_timestamp is None:
                return

            segments.append(
                TranscriptSegment(
                    speaker=current_speaker,
                    text=" ".join(current_lines).strip(),
                    timestamp_start=current_timestamp,
                    timestamp_end=None,
                )
            )

        for line in raw_transcript.splitlines():
            stripped_line = line.strip()
            match = GOOGLE_MEET_LINE_PATTERN.fullmatch(stripped_line)
            if match:
                flush_current_segment()
                current_speaker = match.group("speaker").strip()
                current_timestamp = match.group("timestamp")
                current_lines = []
                continue

            if current_speaker and stripped_line:
                current_lines.append(stripped_line)

        flush_current_segment()

        return segments
