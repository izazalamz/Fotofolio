#!/bin/bash

echo "🚀 Starting Fotofolio Backend..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Check if database exists
if [ ! -f "database/fotofolio.db" ]; then
    echo "🗄️  Initializing database..."
    npm run init-db
fi

# Start the server
echo "🌟 Starting server in development mode..."
npm run dev
