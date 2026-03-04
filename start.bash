#!/bin/bash

# Krishi-Route Master Startup Script
# =====================================

# Get the directory where the script is located
BASE_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$BASE_DIR"

echo "Krishi-Route Master Startup Script"
echo "====================================="

# 1. Backend setup
echo "[1/3] Checking Backend..."
if [ ! -d "backend" ]; then
    echo "[ERROR] Backend directory not found!"
    read -p "Press enter to exit"
    exit 1
fi

cd backend
if [ ! -f .env ]; then
    echo "[!] .env missing in backend. Copying from .env.placeholder..."
    if [ -f .env.placeholder ]; then
        cp .env.placeholder .env
        echo "[!] EDIT backend/.env : add your MONGO_URI before continuing."
        read -p "Press enter after editing"
    else
        echo "[ERROR] .env.placeholder missing in backend!"
        cd ..
        read -p "Press enter to exit"
        exit 1
    fi
fi

if [ ! -d node_modules ]; then
    echo "[2/3] Installing Backend Dependencies..."
    npm install --no-fund --no-audit
else
    echo "[2/3] Backend dependencies already installed. Skipping..."
fi
cd ..

# 2. Frontend setup
echo "[3/3] Checking Frontend..."
if [ ! -d "frontend" ]; then
    echo "[ERROR] Frontend directory not found!"
    read -p "Press enter to exit"
    exit 1
fi

cd frontend
if [ ! -f .env ]; then
    echo "[!] .env missing in frontend. Copying from .env.placeholder..."
    if [ -f .env.placeholder ]; then
        cp .env.placeholder .env
    fi
fi

if [ ! -d node_modules ]; then
    echo "Installing Frontend Dependencies..."
    npm install --no-fund --no-audit
else
    echo "Frontend dependencies already installed. Skipping..."
fi
cd ..

# 3. Launch
echo "====================================="
echo "Launching Krishi-Route..."
echo "====================================="
echo "[NOTE] Database will be cleared and re-seeded for fresh analytics."
(cd backend && node clear_and_seed.js)

# Start backend in background or new terminal if possible
echo "Starting Backend API (port 5000)..."
if command -v gnome-terminal >/dev/null 2>&1; then
    gnome-terminal -- bash -c "cd '$BASE_DIR/backend'; export NODE_ENV=development; node server.js; exec bash"
elif command -v xterm >/dev/null 2>&1; then
    xterm -e "cd '$BASE_DIR/backend'; export NODE_ENV=development; node server.js; exec bash" &
else
    # Fallback to background process if no terminal emulator found
    (cd "$BASE_DIR/backend" && export NODE_ENV=development && node server.js) &
fi

# Wait a moment for backend to start
sleep 3

# Start frontend
echo "Starting Frontend UI (port 5173)..."
if command -v gnome-terminal >/dev/null 2>&1; then
    gnome-terminal -- bash -c "cd '$BASE_DIR/frontend'; npm run dev; exec bash"
elif command -v xterm >/dev/null 2>&1; then
    xterm -e "cd '$BASE_DIR/frontend'; npm run dev; exec bash" &
else
    (cd "$BASE_DIR/frontend" && npm run dev) &
fi

echo ""
echo "Both services starting..."
echo ""
echo "Access the app at http://localhost:5173"
echo ""
echo "Default credentials:"
echo "  Farmers:  farmer1@krishiroute.com (pw: 123456)"
echo "  Mandis:   mandi_tn1@krishiroute.com (pw: 123456)"
echo ""
read -p "Press enter to exit launcher (services will keep running if in background)"
