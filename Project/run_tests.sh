#!/bin/bash
set -e

# Configuration
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$PROJECT_DIR/src/backend"
FRONTEND_DIR="$PROJECT_DIR/src/frontend"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting Full Test Suite...${NC}"

# ==========================================
# Backend Tests
# ==========================================
echo -e "\n${GREEN}[Backend] Running Pytest...${NC}"

# Activate virtual environment
if [ -f "$BACKEND_DIR/venv/bin/activate" ]; then
    source "$BACKEND_DIR/venv/bin/activate"
else
    echo -e "${RED}Error: Backend venv not found at $BACKEND_DIR/venv${NC}"
    exit 1
fi

# Run tests from Project root
cd "$PROJECT_DIR"
export OPENAI_API_KEY=dummy
# Ensure src/backend is in python path if needed, though conftest handles it
export PYTHONPATH=$PYTHONPATH:$BACKEND_DIR

# Run pytest with coverage (quiet mode)
# -q: quiet
# --tb=no: turn off traceback printing (failed tests won't show stack traces, just failure status)
# --disable-warnings: hide warning summary
pytest -q --tb=no --disable-warnings --cov=src/backend/app tests/backend

if [ $? -eq 0 ]; then
    echo -e "${GREEN}[Backend] Tests Passed!${NC}"
else
    echo -e "${RED}[Backend] Tests Failed!${NC}"
    exit 1
fi

# ==========================================
# Frontend Tests
# ==========================================
echo -e "\n${GREEN}[Frontend] Running Jest...${NC}"

cd "$FRONTEND_DIR"

if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install > /dev/null 2>&1
fi

# Run Jest with coverage, non-interactive, quiet
# --silent: prevents console.log/error from tests appearing
# --reporters: minimal reporting
# 2> /dev/null: hide stderr if desired, but might hide helpful runner errors. Let's stick to --silent.
npm test -- --coverage --watchAll=false --silent

if [ $? -eq 0 ]; then
    echo -e "${GREEN}[Frontend] Tests Passed!${NC}"
else
    echo -e "${RED}[Frontend] Tests Failed!${NC}"
    exit 1
fi

echo -e "\n${GREEN}=======================================${NC}"
echo -e "${GREEN}   ALL TESTS PASSED SUCCESSFULLY   ${NC}"
echo -e "${GREEN}=======================================${NC}"
