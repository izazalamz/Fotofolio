@echo off
REM Fotofolio Development Startup Script for Windows
REM This script sets up and starts the development environment

echo 🚀 Starting Fotofolio Development Environment...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 14+ first.
    pause
    exit /b 1
)

REM Check Node.js version
for /f "tokens=1,2 delims=." %%a in ('node -v') do set NODE_VERSION=%%a
set NODE_VERSION=%NODE_VERSION:~1%
if %NODE_VERSION% lss 14 (
    echo ❌ Node.js version 14+ is required. Current version: 
    node -v
    pause
    exit /b 1
)

echo ✅ Node.js version: 
node -v

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not installed. Please install npm first.
    pause
    exit /b 1
)

echo ✅ npm version: 
npm --version

REM Check if dependencies are installed
if not exist "node_modules" (
    echo 📦 Installing root dependencies...
    npm install
)

if not exist "Backend\node_modules" (
    echo 📦 Installing backend dependencies...
    cd Backend
    npm install
    cd ..
)

REM Check if database exists
if not exist "Backend\fotofolio.db" (
    echo 🗄️  Initializing database...
    npm run backend:init-db
)

echo 🎯 Starting development servers...
echo    Backend: http://localhost:3000
echo    Frontend: http://localhost:8080
echo    Startup Guide: http://localhost:8080/start.html
echo.
echo Press Ctrl+C to stop all servers
echo.

REM Start development servers
npm run dev

pause
