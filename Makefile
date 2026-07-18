# Run tests silently (no API calls)
# make test

# Run tests and see print output
# make test-verbose

# Run integration test (reads GOOGLE_API_KEY from .env)
# make test-integration

# Run integration test with output
# make test-integration-verbose

.PHONY: help install test test-verbose test-integration test-integration-verbose test-all clean check-env

PYTHON := .venv/bin/python

help:
	@echo "Memoir - Development Commands"
	@echo ""
	@echo "  make install                  - Install dependencies"
	@echo "  make test                     - Run fast tests (no API calls)"
	@echo "  make test-verbose             - Run fast tests with output (-s flag)"
	@echo "  make test-integration         - Run LLM integration test (requires .env)"
	@echo "  make test-integration-verbose - Run integration test with output"
	@echo "  make test-all                 - Run all tests"
	@echo "  make clean                    - Clear pytest/bytecode caches"
	@echo ""

install:
	$(PYTHON) -m pip install --upgrade pip
	$(PYTHON) -m pip install -r requirements.txt

check-env:
	@if [ ! -f .env ]; then \
		echo "❌ Error: .env file not found."; \
		echo "Please create a .env file in the root directory."; \
		exit 1; \
	fi
	@if ! grep -q "GOOGLE_API_KEY" .env; then \
		echo "❌ Error: GOOGLE_API_KEY not found in .env file."; \
		echo "Please add GOOGLE_API_KEY=your_key to your .env file."; \
		exit 1; \
	fi

test:
	@echo "Running fast tests..."
	$(PYTHON) -m pytest -m "not integration" -q

test-verbose:
	@echo "Running fast tests with output..."
	$(PYTHON) -m pytest -m "not integration" -v -s

test-integration: check-env
	@echo "Running LLM integration test..."
	$(PYTHON) -m pytest -m integration -q

test-integration-verbose: check-env
	@echo "Running LLM integration test with output..."
	$(PYTHON) -m pytest -m integration -s

test-all: check-env
	@echo "Running all tests..."
	$(PYTHON) -m pytest -q

clean:
	@echo "Clearing caches..."
	find . -type d -name "__pycache__" -exec rm -rf {} +
	rm -rf .pytest_cache