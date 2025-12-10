@echo off
title VoxAI Backend

echo ========================================
echo    VoxAI Backend - MongoDB + JWT
echo ========================================
echo.

REM Check if .env exists
if not exist ".env" (
    echo [WARNING] .env file not found!
    echo Creating .env from .env.example...
    copy .env.example .env
    echo.
    echo IMPORTANT: Edit .env file and configure:
    echo   - MONGODB_URI
    echo   - GROQ_API_KEY
    echo   - ELEVENLABS_API_KEY
    echo   - TAVILY_API_KEY
    echo   - JWT_SECRET_KEY
    echo.
    pause
)

REM Check if virtual environment exists
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate

REM Install dependencies
echo Installing dependencies...
pip install -r requirements.txt

REM Run database initialization (optional)
if exist "init_db.py" (
    echo Initializing database...
    python init_db.py
)

REM Start the backend server
echo.
echo ========================================
echo Starting VoxAI Backend Server...
echo Backend will run on http://localhost:8000
echo API Docs at http://localhost:8000/docs
echo ========================================
echo.
python main.py

pause