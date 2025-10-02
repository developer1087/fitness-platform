# Ryzup Fitness - Training Management Platform

**Status:** 🟢 Active Development - Google Play Testing Phase
**Last Updated:** October 2, 2025

## Project Overview
A comprehensive fitness training management system with **three separate applications**:
- **Landing Page** (ryzup.me): Marketing website
- **Web App** (app.ryzup.me): Trainer dashboard for managing trainees
- **Mobile App**: React Native app for trainees (workouts, progress tracking)

## Architecture Decisions
- **Separate repositories** for each application (landing, web, mobile in monorepo)
- **Firebase-first backend** for real-time features and scalability
- **Direct Firestore access** - Mobile app queries Firestore directly (no REST API)
- **Vercel hosting** for web apps with auto-deployment
- **EAS Build** for mobile app distribution

## Tech Stack
### Frontend
- Web: Next.js 15 + TypeScript + Tailwind CSS
- Mobile: React Native + Expo Router + NativeWind
- State: Zustand + React Query
- Forms: React Hook Form + Zod validation

### Backend (Phase 1)
- Database: Firebase Firestore
- Auth: Firebase Auth
- Storage: Firebase Storage
- Functions: Firebase Functions
- Push: Firebase Cloud Messaging

### Development Tools
- Package Manager: npm/yarn
- Linting: ESLint + Prettier
- Testing: Jest + React Testing Library
- Git: Conventional commits

## Repository Structure

### 1. Landing Page
- **Repo:** `fitness-platform-landing`
- **Location:** `/Users/avi/Desktop/fitness-platform-landing`
- **Domain:** `ryzup.me`
- **Deploy:** Vercel (auto-deploy on push to main)

### 2. Web App (Trainer Dashboard)
- **Repo:** `fitness-platform-web-standalone`
- **Location:** `/Users/avi/Desktop/fitness-platform-web-standalone`
- **Domain:** `app.ryzup.me`
- **Deploy:** Vercel (auto-deploy on push to main)

### 3. Mobile App (Trainee App)
- **Repo:** Part of `Fitness Platform` monorepo
- **Location:** `/Users/avi/Desktop/Fitness Platform/apps/mobile`
- **Branch:** `develop`
- **Deploy:** EAS Build → Google Play Store
- **Package:** `com.ryzup.fitness`

## Current Project Structure (Monorepo)
```
Fitness Platform/
├── apps/
│   └── mobile/           # React Native trainee app
├── CLAUDE.md            # This file
├── SYSTEM_OVERVIEW.md   # Comprehensive system documentation
├── GOOGLE_PLAY_TESTING.md  # Testing guide for testers
└── packages/            # Shared utilities (minimal use)
```

## Key Commands

### Mobile App
```bash
cd "/Users/avi/Desktop/Fitness Platform/apps/mobile"
npx expo start                      # Start development server
npx expo-doctor                     # Validate configuration
eas build --platform android --profile preview      # Build APK
eas build --platform android --profile production   # Build AAB
```

### Web Apps
```bash
# Landing Page
cd /Users/avi/Desktop/fitness-platform-landing
npm run dev

# Web Dashboard
cd /Users/avi/Desktop/fitness-platform-web-standalone
npm run dev
```

## Development Workflow
1. Create feature branch: `git checkout -b feature/feature-name`
2. Develop with Claude Code assistance
3. Test changes: `npm run test`
4. Commit changes: `git commit -m "feat: description"`
5. Create PR and merge

## Firebase Configuration
- **Project ID:** `fitness-platform-us-1759049736`
- **Region:** US
- **Collections:** `trainers`, `trainees`, `trainee_invitations`, `users`
- **Auth:** Email/Password
- **Security Rules:** Role-based access (trainers/trainees)

## Current Features Status

### ✅ Implemented
1. **Authentication** - Firebase Auth for trainers and trainees
2. **Trainee Invitation System** - Email invitations with tokens
3. **Mobile Device Detection** - Auto-redirect to app store for mobile users
4. **Direct Firestore Access** - Mobile app queries directly (no REST API)
5. **Multi-domain Setup** - ryzup.me (landing) + app.ryzup.me (dashboard)

### 🚧 In Progress
1. **Google Play Testing** - Building APK/AAB for distribution
2. **Workout Management** - Create and assign workouts
3. **Progress Tracking** - Trainee progress in mobile app

### 📋 Planned
1. **In-app Messaging** - Trainer-trainee communication
2. **Payment Integration** - Subscription management
3. **iOS App** - Build and deploy to App Store

## Important Links
- **EAS Builds:** https://expo.dev/accounts/aviisraeli/projects/ryzup/builds
- **Landing:** https://ryzup.me
- **Web App:** https://app.ryzup.me
- **Firebase Console:** https://console.firebase.google.com/project/fitness-platform-us-1759049736

## Quick Reference

**Test Account:**
- Email: `test@ryzup.me`
- Password: `avivAA87`

**Mobile App Package:** `com.ryzup.fitness`
**Deep Link Scheme:** `ryzup://`

For detailed system information, see `SYSTEM_OVERVIEW.md`
