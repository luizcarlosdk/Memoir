.PHONY: help test test-fast test-integration test-all test-verbose test-integration-verbose install

help:
	@echo "Memoir - Development Commands"
	@echo ""
	@echo "  make install                  - Install dependencies"
	@echo "  make test                     - Run fast tests (no API calls)"
	@echo "  make test-verbose             - Run fast tests with output (-s flag)"
	@echo "  make test-integration         - Run LLM integration test (requires GOOGLE_API_KEY)"
	@echo "  make test-integration-verbose - Run integration test with output"
	@echo "  make test-all                 - Run all tests"
	@echo ""

install:
	.venv/bin/python -m pip install --upgrade pip
	.venv/bin/python -m pip install -r requirements.txt 2>/dev/null || true

test:
	@echo "Running fast tests..."
	.venv/bin/python -m pytest -m "not integration" -q

test-verbose:
	@echo "Running fast tests with output..."
	.venv/bin/python -m pytest -m "not integration" -s

test-integration:
	@if [ -z "$$GOOGLE_API_KEY" ]; then \
		echo "❌ Error: GOOGLE_API_KEY not set"; \
		echo ""; \
		echo "Usage: GOOGLE_API_KEY=your_key make test-integration"; \
		exit 1; \
	fi
	@echo "Running LLM integration test..."
	.venv/bin/python -m pytest -m integration -q

test-integration-verbose:
	@if [ -z "$$GOOGLE_API_KEY" ]; then \
		echo "❌ Error: GOOGLE_API_KEY not set"; \
		echo ""; \
		echo "Usage: GOOGLE_API_KEY=your_key make test-integration-verbose"; \
		exit 1; \
	fi
	@echo "Running LLM integration test with output..."
	.venv/bin/python -m pytest -m integration -s

test-all:
	@if [ -z "$$GOOGLE_API_KEY" ]; then \
		echo "⚠️  Warning: GOOGLE_API_KEY not set, skipping integration tests"; \
		make test; \
	else \
		.venv/bin/python -m pytest -q; \
	fi
