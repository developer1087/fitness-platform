#!/bin/bash

# Development deployment script
set -e

echo "🚀 Starting development deployment..."

# Set environment
export NODE_ENV=development

# Copy development Firebase config
cp firebase.dev.json firebase.json
cp firestore.dev.rules firestore.rules

echo "📋 Copied development configurations"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build web app for development
echo "🏗️  Building web application..."
cd apps/web
npm run build
cd ../..

# Start Firebase emulators
echo "🔥 Starting Firebase emulators..."
firebase emulators:start --project fitness-platform-dev

echo "✅ Development environment ready!"
echo "🌐 Web UI: http://localhost:3000"
echo "🔥 Firebase UI: http://localhost:4000"