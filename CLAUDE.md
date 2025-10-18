# Ryzup Fitness - Training Management Platform

**Status:** 🟢 Active Development - Production Deployment Mode
**Last Updated:** October 4, 2025

## Project Overview
A comprehensive fitness training management system with **three separate applications**:
- **Landing Page** (ryzup.me): Marketing website
- **Web App** (app.ryzup.me): Trainer dashboard for managing trainees
- **Mobile App**: React Native app for trainees (workouts, progress tracking)

## Development Workflow
**IMPORTANT:** We work in **production-first mode**:
- ✅ **No local development** - all changes deploy directly to production
- ✅ **Vercel auto-deploys** on git push (landing + web apps)
- ✅ **EAS builds** for mobile app (download and install APK)
- ✅ **Firebase production instance** - single project for all environments
- ⚠️ **Be careful** - every change goes live immediately!

## Architecture Decisions
- **Separate repositories** for each application (landing, web, mobile)
- **THIS REPOSITORY** contains only the mobile app - web apps are in separate repos
- **Firebase-first backend** for real-time features and scalability
- **Direct Firestore access** - Mobile app queries Firestore directly (no REST API)
- **Vercel hosting** for web apps with auto-deployment on push (separate repos)
- **EAS Build** for mobile app distribution (download APK links)

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
- **Repo:** `Fitness Platform` (THIS REPOSITORY - mobile-only)
- **Location:** `/Users/avi/Desktop/Fitness Platform/apps/mobile`
- **Branch:** `develop`
- **Deploy:** EAS Build → Google Play Store
- **Package:** `com.ryzup.fitness`
- **GitHub:** `https://github.com/developer1087/fitness-platform.git`
- **Note:** This repo does NOT deploy to Vercel (mobile-only)

## Current Project Structure (Mobile-Only Repository)
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
- **Auth Methods:**
  - **Primary:** Phone Authentication (SMS verification) - Israeli numbers (`05XXXXXXXX`)
  - **Fallback:** Email/Password, Google OAuth
- **Security Rules:** Role-based access (trainers/trainees)
- **Phone Auth:** Configured for Israeli market (+972 prefix)

## Current Features Status

### ✅ Implemented
1. **Role-Based Authentication System**
   - Trainers: Email/Password or Google OAuth (web only)
   - Trainees: Phone Authentication (SMS verification) - PRIMARY METHOD
   - Email/Password fallback for trainees
   - Automatic role assignment (`trainer` vs `trainee`)
   - TrainerLayout blocks trainee access to web dashboard

2. **Phone Authentication (NEW - October 2025)**
   - Israeli phone number format: `05XXXXXXXX` (auto-formatted to +972)
   - 3-step signup flow: Phone → SMS Code → Profile
   - React Native Firebase phone auth integration
   - PhoneAuthScreen component with professional UX
   - Automatic Firestore user profile creation
   - Error handling for SMS quota, invalid codes, etc.

3. **Trainee Invitation System**
   - **Primary:** SMS invitations with phone numbers
   - **Fallback:** Email invitations
   - Unique invitation tokens (7-day expiration)
   - Pending/Active status management
   - Auto-link trainee to trainer on signup

4. **Infrastructure**
   - Mobile Device Detection - Auto-redirect to app store
   - Direct Firestore Access - No REST API needed
   - Multi-domain Setup - ryzup.me + app.ryzup.me
   - Shared Types - Consistent types across web and mobile

### 🚧 In Progress (Next Steps)
1. **Complete Phone Auth Integration**
   - Update trainee invitation modal (phone number field)
   - SMS invitation service/API
   - Update traineeService for phone-based queries
   - Firebase Console phone auth configuration

2. **Google Play Testing** - APK/AAB distribution
3. **Workout Management** - Create and assign workouts
4. **Progress Tracking** - Trainee progress in mobile app

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
