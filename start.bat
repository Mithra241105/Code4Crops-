@echo off
setlocal enabledelayedexpansion

echo Krishi-Route Master Startup Script
echo =====================================

:: Get the directory where the script is located
set "BASE_DIR=%~dp0"
cd /d "%BASE_DIR%"

:: 1. Backend setup
echo [1/3] Checking Backend...
if not exist "backend" (
    echo [ERROR] Backend directory not found!
    pause
    exit /b 1
)

pushd backend
if not exist .env (
    echo [!] .env missing in backend. Copying from .env.placeholder...
    if exist .env.placeholder (
        copy .env.placeholder .env
        echo [!] EDIT backend\.env : add your MONGO_URI before continuing.
        pause
    ) else (
        echo [ERROR] .env.placeholder missing in backend!
        popd
        pause
        exit /b 1
    )
)

if not exist node_modules (
    echo [2/3] Installing Backend Dependencies...
    call npm install --no-fund --no-audit
) else (
    echo [2/3] Backend dependencies already installed. Skipping...
)
popd

:: 2. Frontend setup
echo [3/3] Checking Frontend...
if not exist "frontend" (
    echo [ERROR] Frontend directory not found!
    pause
    exit /b 1
)

pushd frontend
if not exist .env (
    echo [!] .env missing in frontend. Copying from .env.placeholder...
    if exist .env.placeholder (
        copy .env.placeholder .env
    )
)

if not exist node_modules (
    echo Installing Frontend Dependencies...
    call npm install --no-fund --no-audit
) else (
    echo Frontend dependencies already installed. Skipping...
)
popd

:: 3. Launch
echo =====================================
echo Launching Krishi-Route...
echo =====================================
echo [NOTE] Database will be cleared and re-seeded for fresh analytics.
pushd backend
node clear_and_seed.js
popd

:: Start backend
echo Starting Backend API (port 5000)...
start "Krishi-Route Backend" powershell -NoExit -Command "cd '%BASE_DIR%backend'; $env:NODE_ENV='development'; node server.js"

:: Wait a moment for backend to start
timeout /t 3 /nobreak > nul

:: Start frontend
echo Starting Frontend UI (port 5173)...
start "Krishi-Route Frontend" powershell -NoExit -Command "cd '%BASE_DIR%frontend'; npm run dev"

echo.
echo Both services starting...
echo.
echo Opening browser in 5 seconds...
timeout /t 5 /nobreak > nul
start http://localhost:5173

echo.
echo Default credentials:
echo   Farmers:  farmer1@krishiroute.com (pw: 123456)
echo   Mandis:   mandi_tn1@krishiroute.com (pw: 123456)
echo.
pause
