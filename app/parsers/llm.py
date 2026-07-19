import os
import logging

from pydantic import BaseModel, ConfigDict
from pydantic_ai import Agent
from pydantic_ai.models.google import GoogleModel
from pydantic_ai.providers.google import GoogleProvider

from app.parsers.base import BaseTranscriptParser, TranscriptSegment


class ParsedTranscriptSegment(BaseModel):
    model_config = ConfigDict(extra="forbid")

    speaker: str
    text: str
    timestamp_start: str | None = None
    timestamp_end: str | None = None


class LLMParser(BaseTranscriptParser):
    def __init__(
        self,
        api_key: str | None = None,
        model_name: str | None = None,
    ):
        self.model_name = model_name
        self.api_key = api_key
        if not self.api_key:
            raise ValueError("api_key must be provided to LLMParser.")

        if not self.model_name:
            raise ValueError("model_name must be provided to LLMParser.")

        provider = GoogleProvider(api_key=self.api_key)
        google_model = GoogleModel(self.model_name, provider=provider)
        self.agent = Agent(
            google_model,
            output_type=list[ParsedTranscriptSegment],
            system_prompt=(
                "You extract meeting transcript segments into structured data. "
                "Return only the structured output requested by the schema."
            ),
        )

    def can_parse(self, raw_transcript: str) -> bool:
        return True

    def parse(self, raw_transcript: str) -> list[TranscriptSegment]:
        prompt = f"""Parse the following meeting transcript into structured segments.

            Rules:
            - Keep one item per speaker turn.
            - Preserve the original speaker name.
            - Keep text concise but complete.
            - Use timestamps when present. If a timestamp is missing, leave it null.

            Transcript:
            {raw_transcript}"""

        result = self.agent.run_sync(prompt)
        return result.data
