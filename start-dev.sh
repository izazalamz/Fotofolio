#!/bin/bash

# Fotofolio Development Startup Script
# This script sets up and starts the development environment

echo "🚀 Starting Fotofolio Development Environment..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 14+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 14 ]; then
    echo "❌ Node.js version 14+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ npm version: $(npm -v)"

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing root dependencies..."
    npm install
fi

if [ ! -d "Backend/node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    cd Backend && npm install && cd ..
fi

# Check if database exists
if [ ! -f "Backend/fotofolio.db" ]; then
    echo "🗄️  Initializing database..."
    npm run backend:init-db
fi

echo "🎯 Starting development servers..."
echo "   Backend: http://localhost:3000"
echo "   Frontend: http://localhost:8080"
echo "   Startup Guide: http://localhost:8080/start.html"
echo ""
echo "Press Ctrl+C to stop all servers"
echo ""

# Start development servers
npm run dev
