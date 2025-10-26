SHELL := /bin/bash

TOOLS_DIR := .tools
ONLOOK_REPO := https://github.com/onlook-dev/onlook.git
ONLOOK_DIR := $(TOOLS_DIR)/onlook
PID_DIR := $(ONLOOK_DIR)/.pids
LOG_DIR := $(ONLOOK_DIR)/.logs
ENV_FILE := $(ONLOOK_DIR)/.env
ABS_ONLOOK_DIR := $(abspath $(ONLOOK_DIR))
ABS_LOG_DIR := $(abspath $(LOG_DIR))
ABS_PID_DIR := $(abspath $(PID_DIR))


.DEFAULT_GOAL := help

.PHONY: help
help:
	@echo "Available targets:"
	@echo "  make ui-editor         - Setup (if needed), start backend, build and start UI, open browser"
	@echo "  make ui-editor-setup   - Clone and install Onlook tool"
	@echo "  make ui-editor-env     - Run interactive environment setup"
	@echo "  make ui-editor-backend - Start Supabase backend in background"
	@echo "  make ui-editor-build   - Build standalone UI"
	@echo "  make ui-editor-start   - Start standalone UI server"
	@echo "  make ui-editor-open    - Open UI in browser"
	@echo "  make ui-editor-stop    - Stop backend/server"
	@echo "  make ui-editor-clean   - Remove downloaded tool (\"$(TOOLS_DIR)\")"
	@echo "  make ui-editor-update  - Update the Onlook tool to latest"
	@echo "  make ui-editor-logs    - Tail backend and UI logs with prefixes (foreground; Ctrl-C to stop)"


.PHONY: ui-editor
ui-editor: ui-editor-setup ui-editor-backend ui-editor-build ui-editor-start ui-editor-open ui-editor-logs

.PHONY: _check-prereqs
_check-prereqs:
	@if ! command -v git >/dev/null 2>&1; then echo "Error: git is required." >&2; exit 1; fi
	@if ! command -v node >/dev/null 2>&1; then echo "Error: Node.js (v20+) is required. Install from https://nodejs.org" >&2; exit 1; fi
	@if ! command -v bun >/dev/null 2>&1; then echo "Error: bun is required. Install from https://bun.sh (e.g., 'brew install oven-sh/bun/bun')." >&2; exit 1; fi
	@if ! command -v docker >/dev/null 2>&1; then echo "Error: Docker is required (Docker Desktop on macOS)." >&2; exit 1; fi
	@if ! docker info >/dev/null 2>&1; then echo "Error: Docker daemon is not running. Start Docker Desktop, then rerun 'make ui-editor' (or 'make ui-editor-env' to finish env setup)." >&2; exit 1; fi

.PHONY: ui-editor-setup
ui-editor-setup: _check-prereqs
	@mkdir -p "$(TOOLS_DIR)"
	@if [ ! -d "$(ONLOOK_DIR)" ]; then \
	  echo "Cloning Onlook into $(ONLOOK_DIR)..."; \
	  git clone --depth=1 $(ONLOOK_REPO) "$(ONLOOK_DIR)"; \
	else \
	  echo "Onlook already present at $(ONLOOK_DIR)"; \
	fi
	@echo "Installing dependencies with bun..."; \
	  cd "$(ONLOOK_DIR)" && bun install
	@if [ ! -f "$(ENV_FILE)" ]; then \
	  echo "No $(ENV_FILE) found."; \
	  echo "First run: warming up Supabase images (this may take several minutes on first pull)..."; \
	  echo "Running: cd $(ONLOOK_DIR)/apps/backend && bun run start"; \
	  cd "$(ONLOOK_DIR)/apps/backend" && bun run start || true; \
	  echo "Launching interactive env setup... (if it fails, start Docker Desktop and run 'make ui-editor-env')"; \
	  cd "$(ONLOOK_DIR)" && bun run setup:env || { \
	    echo "Environment setup failed. Likely due to first-time Supabase startup taking too long." >&2; \
	    echo "Do this, then retry:" >&2; \
	    echo "  1) Ensure Docker Desktop is running" >&2; \
	    echo "  2) Warm-up manually: cd $(ONLOOK_DIR)/apps/backend && bun run start" >&2; \
	    echo "  3) Then run: make ui-editor-env" >&2; \
	    exit 1; \
	  }; \
	fi

.PHONY: ui-editor-env
ui-editor-env: _check-prereqs ui-editor-prime-backend
	@cd "$(ONLOOK_DIR)" && bun run setup:env

.PHONY: ui-editor-backend
ui-editor-backend:
	@mkdir -p "$(ABS_PID_DIR)" "$(ABS_LOG_DIR)"
	@bash -lc 'if [ -f "$(ABS_PID_DIR)/backend.pid" ] && kill -0 $$(cat "$(ABS_PID_DIR)/backend.pid") 2>/dev/null; then \
	  echo "Backend already running (PID $$(cat \"$(ABS_PID_DIR)/backend.pid\"))"; \
	else \
	  echo "Starting backend... logs: $(ABS_LOG_DIR)/backend.log"; \
	  cd "$(ONLOOK_DIR)" && nohup bun run backend:start > "$(ABS_LOG_DIR)/backend.log" 2>&1 & echo $$! > "$(ABS_PID_DIR)/backend.pid"; \
	  echo "Started backend (PID $$(cat \"$(ABS_PID_DIR)/backend.pid\"))"; \
	fi'

.PHONY: ui-editor-build
ui-editor-build:
	@cd "$(ONLOOK_DIR)" && bun run build

.PHONY: ui-editor-prime-backend
ui-editor-prime-backend:
	@echo "Warming up Supabase (first run can take several minutes)..."
	@cd "$(ONLOOK_DIR)/apps/backend" && bun run start

ui-editor-start:
	@mkdir -p "$(ABS_PID_DIR)" "$(ABS_LOG_DIR)"
	@bash -lc 'if [ -f "$(ABS_PID_DIR)/server.pid" ] && kill -0 $$(cat "$(ABS_PID_DIR)/server.pid") 2>/dev/null; then \
	  echo "UI server already running (PID $$(cat \"$(ABS_PID_DIR)/server.pid\"))"; \
	else \
	  echo "Starting UI server... logs: $(ABS_LOG_DIR)/server.log"; \
	  cd "$(ONLOOK_DIR)" && nohup bun run start > "$(ABS_LOG_DIR)/server.log" 2>&1 & echo $$! > "$(ABS_PID_DIR)/server.pid"; \
	  echo "Started UI server (PID $$(cat \"$(ABS_PID_DIR)/server.pid\"))"; \
	fi'
.PHONY: ui-editor-open
ui-editor-open:
	@URL=http://localhost:3000; \
	if command -v open >/dev/null 2>&1; then open $$URL; \
	elif command -v xdg-open >/dev/null 2>&1; then xdg-open $$URL; \
	else echo "Open $$URL in your browser"; fi

.PHONY: ui-editor-stop
ui-editor-stop:
	@if [ -f "$(PID_DIR)/server.pid" ]; then \
	  kill $$(cat "$(PID_DIR)/server.pid") 2>/dev/null || true; \
	  rm -f "$(PID_DIR)/server.pid"; \
	  echo "Stopped UI server"; \
	fi
	@if [ -f "$(PID_DIR)/backend.pid" ]; then \
	  kill $$(cat "$(PID_DIR)/backend.pid") 2>/dev/null || true; \
	  rm -f "$(PID_DIR)/backend.pid"; \
	  echo "Stopped backend"; \
	fi

.PHONY: ui-editor-update
ui-editor-update:
	@if [ -d "$(ONLOOK_DIR)" ]; then \
	  cd "$(ONLOOK_DIR)" && git pull --ff-only; \
	else \
	  echo "Onlook not cloned yet (run: make ui-editor-setup)"; \
	fi

.PHONY: ui-editor-clean
ui-editor-clean: ui-editor-stop
	@rm -rf "$(TOOLS_DIR)"
	@echo "Removed $(TOOLS_DIR)"


.PHONY: ui-editor-logs
ui-editor-logs:
	@mkdir -p "$(LOG_DIR)"
	@touch "$(LOG_DIR)/backend.log" "$(LOG_DIR)/server.log"
	@echo "Tailing logs... (Ctrl-C to stop; run 'make ui-editor-logs' to reattach)"
	@bash -lc 'set -e; \
	  tail -n +1 -F "$(LOG_DIR)/backend.log" | awk '\''{printf "[backend] %s\\n", $$0; fflush()}'\'' & T1=$$!; \
	  tail -n +1 -F "$(LOG_DIR)/server.log" | awk '\''{printf "[server] %s\\n", $$0; fflush()}'\'' & T2=$$!; \
	  trap "kill $$T1 $$T2 2>/dev/null || true" INT TERM EXIT; \
	  wait'


