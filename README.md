# Memoir
AI-powered workspace that transforms meeting transcripts into searchable organizational knowledge

## Roadmap

- [x] **Transcript parsing** — format detection, deterministic parsers (Zoom, Google Meet), LLM fallback for messy/unknown formats
- [x] **Storage & Meeting page** — persist transcripts, generate summaries/decisions/action items
- [ ] **Person page** — cross-meeting aggregation of participants and their contributions
- [ ] **Ask AI** — Q&A over a single meeting's transcript
- [ ] **Semantic search** — cross-meeting search and Q&A powered by pgvector
- [ ] **Workspace features** — collaboration and org-level tools

## Development

### Quick Commands

Use `make` for common tasks:

```bash
make run-frontend            # Initialize the database and start the app with reload
make test                     # Run fast tests (quiet)
make test-verbose             # Run fast tests with output (-s flag)
make test-integration         # Run LLM integration test (requires GOOGLE_API_KEY)
make test-integration-verbose # Run integration test with output
make test-all                 # Run all tests
make help                     # Show all commands
```

### Examples

```bash
# Start the frontend at http://127.0.0.1:8000/
make run-frontend

# Run tests silently
make test

# Run tests and see print output
make test-verbose

# Run integration test with your API key
GOOGLE_API_KEY="your_api_key" make test-integration

# Run integration test with output
GOOGLE_API_KEY="your_api_key" make test-integration-verbose
```
