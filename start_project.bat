@echo off
title BLM Startup Script
echo Starting Business Lead Management (BLM) Services...

echo 1. Starting Node.js Backend Server (Port 3001)
start "BLM Backend" cmd /k "cd backend && npm run dev"

echo 2. Starting Python Scraper API (Port 8000)
start "BLM Scraper" cmd /k "cd python-scraper && call ..\.venv\Scripts\activate 2>nul || echo Virtual env not activated automatically & uvicorn main:app --host 0.0.0.0 --port 8000 --reload"

echo 3. Starting React Frontend (Port 3000)
start "BLM Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo All three services are launching in separate windows!
echo Please wait a few seconds for the frontend to open typically at http://localhost:3000
echo You can safely minimize these terminal windows. 
echo To stop the project, simply close the three terminal windows that just opened.
pause
