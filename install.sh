#!/bin/bash

echo "🚀 Setting up AI Text Predictor..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ Node.js version 16 or higher is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully!"
    echo ""
    echo "🎉 Setup complete! To start the app:"
    echo "   npm run dev"
    echo ""
    echo "📝 Optional: Add your OpenAI API key to a .env file:"
    echo "   cp env.example .env"
    echo "   # Then edit .env and add your API key"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi
