from app.parsers.base import BaseTranscriptParser, TranscriptSegment
import re


ZOOM_TIME_RANGE_PATTERN = re.compile(
    r"^(?P<start>\d{2}:\d{2}:\d{2}\.\d{3})\s+-->\s+(?P<end>\d{2}:\d{2}:\d{2}\.\d{3})$",
    re.MULTILINE,
)
ZOOM_SPEAKER_LINE_PATTERN = re.compile(r"^(?P<speaker>[^:]+):\s*(?P<text>.+)$")


class ZoomParser(BaseTranscriptParser):
    def can_parse(self, raw_transcript: str) -> bool:
        has_header = raw_transcript.lstrip().startswith("WEBVTT")
        has_time_ranges = bool(ZOOM_TIME_RANGE_PATTERN.search(raw_transcript))
        return has_header and has_time_ranges

    def parse(self, raw_transcript: str) -> list[TranscriptSegment]:
        segments = []
        lines = raw_transcript.splitlines()
        index = 0

        while index < len(lines):
            line = lines[index].strip()
            time_match = ZOOM_TIME_RANGE_PATTERN.fullmatch(line)

            if not time_match:
                index += 1
                continue

            timestamp_start = time_match.group("start")
            timestamp_end = time_match.group("end")
            index += 1

            while index < len(lines) and not lines[index].strip():
                index += 1

            if index >= len(lines):
                break

            speaker_line = lines[index].strip()
            speaker_match = ZOOM_SPEAKER_LINE_PATTERN.fullmatch(speaker_line)

            if speaker_match:
                segments.append(
                    TranscriptSegment(
                        speaker=speaker_match.group("speaker").strip(),
                        text=speaker_match.group("text").strip(),
                        timestamp_start=timestamp_start,
                        timestamp_end=timestamp_end,
                    ),
                )

            index += 1

        return segments
