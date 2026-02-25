@echo off
setlocal

echo Krishi-Route Master Startup Script
echo =====================================

:: 1. Backend setup
echo [1/3] Checking Backend...
cd backend
if not exist .env (
    echo [!] .env missing in backend. Copying from .env.placeholder...
    copy .env.placeholder .env
    echo [!] EDIT backend\.env : add your MONGO_URI before continuing.
    pause
)
echo [2/3] Installing Backend Dependencies...
call npm install --no-fund --no-audit

:: 2. Frontend setup
echo [3/3] Checking Frontend...
cd ../frontend
if not exist .env (
    echo [!] .env missing in frontend. Copying from .env.placeholder...
    copy .env.placeholder .env
)
echo Installing Frontend Dependencies...
call npm install --no-fund --no-audit

:: 3. Launch
echo =====================================
echo Launching Krishi-Route...
echo =====================================
echo [NOTE] Database will be seeded automatically on first run.
echo        No separate seed step required.

:: Start backend
echo Starting Backend API (port 5000)...
start powershell -NoExit -Command "cd '..\backend'; $env:NODE_ENV='development'; node server.js"

:: Wait a moment for backend to start
timeout /t 3 /nobreak > nul

:: Start frontend
echo Starting Frontend UI (port 5173)...
start powershell -NoExit -Command "npm run dev"

echo.
echo Both services started. Open http://localhost:5173 in your browser.
echo.
echo Default credentials (first run only):
echo   Farmers:  farmer1@krishiroute.com / farmer2@... / farmer3@...
echo   Mandis:   mandi1@krishiroute.com to mandi15@krishiroute.com
echo   Password: 123456
echo.
pause
