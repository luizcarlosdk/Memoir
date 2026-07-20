from pydantic import BaseModel, Field
from pydantic_ai.models.google import GoogleModel
from pydantic_ai.providers.google import GoogleProvider
from pydantic_ai import Agent


class ExtractedActionItem(BaseModel):
    """Represents an action item extracted from a meeting transcript."""

    action_item: str = Field(description="Action item extracted from the meeting")
    responsible_person: str | None = Field(
        default=None,
        description="Person responsible for the action item",
    )


class MeetingInsight(BaseModel):
    """Represents insights extracted from a meeting transcript."""

    summary: str = Field(description="Summary of the meeting")
    decisions: str = Field(description="Decisions made during the meeting")
    action_items: list[ExtractedActionItem] = Field(
        description="Action items from the meeting",
    )


class SummarizationService:
    """Service to summarize meeting transcripts and extract meeting insights."""

    def __init__(self, api_key: str, model: str):
        self.api_key = api_key
        self.model = model
        if not self.api_key:
            raise ValueError("API key must be provided for the SummarizationService.")
        if not self.model:
            raise ValueError(
                "Model name must be provided for the SummarizationService."
            )

        provider = GoogleProvider(api_key=self.api_key)
        google_model = GoogleModel(self.model, provider=provider)
        self.agent = Agent(
            google_model,
            output_type=MeetingInsight,
            system_prompt=(
                "You are an AI meeting assistant. Analyse the transcript and "
                "extract a concise summary, key decisions, and action items. "
                "Rules for action items:\n"
                "1. Clearly describe the task.\n"
                "2. Identify the specific person responsible.\n"
                "3. If no responsible person is mentioned,\n"
                "   set the responsible_person to null.\n"
                "4. Don't guess or invent names; only use names mentioned "
                "in the transcript.\n"
            ),
        )

    def summarize_meeting(self, raw_transcript: str) -> MeetingInsight:
        """Summarizes the meeting transcript and extracts insights."""
        result = self.agent.run_sync(raw_transcript)
        return result.output
