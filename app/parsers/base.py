from dataclasses import dataclass
from typing import Optional, list

from ABC import ABC, abstractmethod


class TranscriptSegment:
    speaker: str
    text: str
    timestamp_start: Optional[str] = None
    timestamp_end: Optional[str] = None


@dataclass
class TranscriptParser(ABC):
    @abstractmethod
    def can_parse(self, raw_transcript: str) -> bool:
        pass

    @abstractmethod
    def parse(self, raw_transcript: str) -> list[TranscriptSegment]:
        pass
