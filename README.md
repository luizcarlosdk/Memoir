# Memoir
AI-powered workspace that transforms meeting transcripts into searchable organizational knowledge

![Memoir meetings dashboard](docs/images/mainpage.png)

Memoir helps individuals and small teams organize what happened during their meetings. When a transcript is uploaded, Memoir extracts the summary, participants, actions-items and the decisions made.

> [!NOTE]
> Memoir is currently in early development. The meeting processing workflow is
> functional, but APIs and database models may still change.

## Roadmap

- [x] **Transcript parsing** — format detection, deterministic parsers (Zoom, Google Meet), LLM fallback for messy/unknown formats
- [x] **Storage & Meeting page** — persist transcripts, generate summaries/decisions/action items
- [x] **Person page** — cross-meeting aggregation of participants and their contributions
- [ ] **Ask AI** — Q&A over a single meeting's transcript
- [ ] **Semantic search** — cross-meeting search and Q&A powered by pgvector
- [ ] **Workspace features** — collaboration and org-level tools
- [ ] **MCP Support** — create MCP routes for agents interaction

## Supported transcript formats

- Zoom
- Google Meet
- Plain text
- Unknown or irregular formats through the LLM fallback parser (Only by gemini api key for now)

## Development

### Quick Commands

Use `make` for common tasks:

```bash
make run                      # Initialize the application
make test-all                 # Run all tests
make help                     # Show all commands
```
