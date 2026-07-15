.PHONY: help install test test-verbose test-integration test-integration-verbose test-all clean check-key

PYTHON := .venv/bin/python

help:
	@echo "Memoir - Development Commands"
	@echo ""
	@echo "  make install                  - Install dependencies"
	@echo "  make test                     - Run fast tests (no API calls)"
	@echo "  make test-verbose             - Run fast tests with output (-s flag)"
	@echo "  make test-integration         - Run LLM integration test (requires GOOGLE_API_KEY)"
	@echo "  make test-integration-verbose - Run integration test with output"
	@echo "  make test-all                 - Run all tests"
	@echo "  make clean                    - Clear pytest/bytecode caches"
	@echo ""

install:
	$(PYTHON) -m pip install --upgrade pip
	$(PYTHON) -m pip install -r requirements.txt

check-key:
	@if [ -z "$$GOOGLE_API_KEY" ]; then \
		echo "❌ Error: GOOGLE_API_KEY not set"; \
		echo ""; \
		echo "Usage: GOOGLE_API_KEY=your_key make test-integration"; \
		exit 1; \
	fi

test:
	@echo "Running fast tests..."
	$(PYTHON) -m pytest -m "not integration" -q

test-verbose:
	@echo "Running fast tests with output..."
	$(PYTHON) -m pytest -m "not integration" -s

test-integration: check-key
	@echo "Running LLM integration test..."
	$(PYTHON) -m pytest -m integration -q

test-integration-verbose: check-key
	@echo "Running LLM integration test with output..."
	$(PYTHON) -m pytest -m integration -s

test-all:
	@if [ -z "$$GOOGLE_API_KEY" ]; then \
		echo "⚠️  Warning: GOOGLE_API_KEY not set, skipping integration tests"; \
		$(MAKE) test; \
	else \
		$(PYTHON) -m pytest -q; \
	fi

clean:
	@echo "Clearing caches..."
	find . -type d -name "__pycache__" -exec rm -rf {} +
	rm -rf .pytest_cache