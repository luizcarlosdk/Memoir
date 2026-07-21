from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Optional


@dataclass
class TranscriptSegment:
    speaker: str
    text: str
    timestamp_start: Optional[str] = None
    timestamp_end: Optional[str] = None


class BaseTranscriptParser(ABC):
    platform: str | None = None

    @abstractmethod
    def can_parse(self, raw_transcript: str) -> bool:
        pass

    @abstractmethod
    def parse(self, raw_transcript: str) -> list[TranscriptSegment]:
        pass
