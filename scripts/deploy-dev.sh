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

# Mobile app development - this repo is mobile-only
echo "📱 This is a mobile-only repository"
echo "🌐 Web app development: fitness-platform-web repo"
echo "🌐 Landing page development: fitness-platform-landing repo"
echo ""
echo "📱 For mobile app development, use:"
echo "   cd apps/mobile"
echo "   npx expo start"
echo ""
echo "✅ Mobile development environment ready!"