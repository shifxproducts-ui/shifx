#!/usr/bin/env bash
# ============================================================
#  SHIFX PRODUCTS — Full-Stack Dev Starter
#  Starts FastAPI backend (port 8000) + Vite frontend (port 3000)
#  Usage:  bash start.sh
# ============================================================

set -e

# ── Colors ──
RED='\033[0;31m'; GREEN='\033[0;32m'; CYAN='\033[0;36m'; YELLOW='\033[1;33m'; NC='\033[0m'

echo -e "${CYAN}"
echo "  ███████╗██╗  ██╗██╗███████╗██╗  ██╗"
echo "  ██╔════╝██║  ██║██║██╔════╝╚██╗██╔╝"
echo "  ███████╗███████║██║█████╗   ╚███╔╝ "
echo "  ╚════██║██╔══██║██║██╔══╝   ██╔██╗ "
echo "  ███████║██║  ██║██║██║     ██╔╝ ██╗"
echo "  ╚══════╝╚═╝  ╚═╝╚═╝╚═╝     ╚═╝  ╚═╝  PRODUCTS"
echo -e "${NC}"

# ── Check prerequisites ──
check_cmd() {
  if ! command -v "$1" &> /dev/null; then
    echo -e "${RED}✗ $1 not found. Please install it first.${NC}"
    exit 1
  fi
}
check_cmd python3
check_cmd node
check_cmd npm

# ── Setup backend ──
echo -e "\n${YELLOW}[1/4] Setting up backend...${NC}"
cd backend

if [ ! -f ".env" ]; then
  cp .env.example .env
  echo -e "${YELLOW}  ⚠  Created backend/.env from example — edit DATABASE_URL and SECRET_KEY!${NC}"
fi

if [ ! -d "venv" ]; then
  echo "  Creating Python virtual environment..."
  python3 -m venv venv
fi

source venv/bin/activate
echo "  Installing Python dependencies..."
pip install -r requirements.txt -q

echo -e "\n${YELLOW}[2/4] Seeding database (skipped if already done)...${NC}"
python3 seed.py || echo -e "${YELLOW}  ⚠  Seed skipped (DB may already have data or DB not reachable yet)${NC}"

# ── Setup frontend ──
echo -e "\n${YELLOW}[3/4] Setting up frontend...${NC}"
cd ../frontend

if [ ! -d "node_modules" ]; then
  echo "  Installing npm packages..."
  npm install
fi

if [ ! -f ".env" ]; then
  cp .env.example .env
fi

# ── Launch both servers ──
echo -e "\n${YELLOW}[4/4] Starting servers...${NC}"
echo -e "  ${GREEN}Backend:  http://localhost:8000${NC}  (FastAPI + PostgreSQL)"
echo -e "  ${GREEN}Frontend: http://localhost:3000${NC}  (React + Vite)"
echo -e "  ${GREEN}API Docs: http://localhost:8000/docs${NC}"
echo ""
echo -e "${CYAN}Press Ctrl+C to stop both servers.${NC}\n"

# Start backend in background
cd ../backend
source venv/bin/activate
uvicorn main:app --reload --port 8000 &
BACKEND_PID=$!

# Start frontend in foreground
cd ../frontend
npm run dev

# Cleanup on exit
trap "kill $BACKEND_PID 2>/dev/null" EXIT
