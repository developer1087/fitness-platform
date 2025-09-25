#!/bin/bash

# Production deployment script
set -e

echo "🚀 Starting production deployment..."

# Ensure we're on main branch
BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$BRANCH" != "main" ]; then
    echo "❌ Error: Must be on main branch for production deployment"
    echo "Current branch: $BRANCH"
    exit 1
fi

# Check if working directory is clean
if [ -n "$(git status --porcelain)" ]; then
    echo "❌ Error: Working directory is not clean"
    echo "Please commit or stash your changes before deploying"
    exit 1
fi

# Set environment
export NODE_ENV=production

# Copy production Firebase config
cp firebase.prod.json firebase.json
cp firestore.prod.rules firestore.rules

echo "📋 Copied production configurations"

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --production

# Run tests
echo "🧪 Running tests..."
npm run test

# Build web app for production
echo "🏗️  Building web application..."
cd apps/web
npm run build
cd ../..

# Deploy to Firebase
echo "☁️  Deploying to Firebase..."
firebase deploy --project fitness-platform-prod

echo "✅ Production deployment complete!"
echo "🌐 Live URL: https://fitness-platform-prod.firebaseapp.com"