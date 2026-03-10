@echo off
:: ============================================================
::  SHIFX PRODUCTS — Full-Stack Dev Starter (Windows)
::  Usage:  start.bat
:: ============================================================

echo.
echo  ====================================
echo   SHIFX PRODUCTS — Starting servers
echo  ====================================
echo.

:: ── Backend setup ──
echo [1/4] Setting up backend...
cd backend

if not exist ".env" (
    copy .env.example .env
    echo   Created backend\.env — edit DATABASE_URL and SECRET_KEY!
)

if not exist "venv" (
    echo   Creating Python virtual environment...
    python -m venv venv
)

call venv\Scripts\activate
echo   Installing Python dependencies...
pip install -r requirements.txt -q

echo.
echo [2/4] Seeding database...
python seed.py

:: ── Frontend setup ──
echo.
echo [3/4] Setting up frontend...
cd ..\frontend

if not exist "node_modules" (
    echo   Installing npm packages...
    npm install
)

:: ── Launch ──
echo.
echo [4/4] Starting servers...
echo   Backend:  http://localhost:8000
echo   Frontend: http://localhost:3000
echo   API Docs: http://localhost:8000/docs
echo.

:: Start backend in new window
cd ..\backend
start "SHIFX Backend" cmd /k "venv\Scripts\activate && uvicorn main:app --reload --port 8000"

:: Start frontend in this window
cd ..\frontend
npm run dev
