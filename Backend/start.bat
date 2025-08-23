@echo off
echo 🚀 Starting Fotofolio Backend...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not installed. Please install npm first.
    pause
    exit /b 1
)

REM Check if dependencies are installed
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    npm install
)

REM Check if database exists
if not exist "database\fotofolio.db" (
    echo 🗄️  Initializing database...
    npm run init-db
)

REM Start the server
echo 🌟 Starting server in development mode...
npm run dev

pause
