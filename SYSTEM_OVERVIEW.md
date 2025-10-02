# Ryzup Fitness Platform - System Overview

**Last Updated:** October 2, 2025
**Project Owner:** Avi Israeli (aviisraeli)
**Status:** 🟢 Active Development - Google Play Testing Phase

---

## 🌐 System Architecture

### Three Separate Applications

```
ryzup.me                    → Landing Page (Marketing)
app.ryzup.me                → Web App (Trainer Dashboard)
[Mobile App]                → React Native (Trainee App)
```

---

## 📁 Repository Structure

### 1. **Landing Page**
**Repository:** `fitness-platform-landing`
**Location:** `/Users/avi/Desktop/fitness-platform-landing`
**GitHub:** `https://github.com/aviz85/fitness-platform-landing`
**Deployment:** Vercel
**Domain:** `ryzup.me`

**Tech Stack:**
- Next.js 15
- TypeScript
- Tailwind CSS

**Purpose:** Public-facing marketing website

**Pages:**
- `/` - Home page
- `/contact` - Contact form
- `/privacy` - Privacy policy
- `/terms` - Terms of service

---

### 2. **Web App (Trainer Dashboard)**
**Repository:** `fitness-platform-web-standalone`
**Location:** `/Users/avi/Desktop/fitness-platform-web-standalone`
**GitHub:** `https://github.com/developer1087/fitness-platform-web.git`
**Deployment:** Vercel
**Domain:** `app.ryzup.me`

**Tech Stack:**
- Next.js 15
- TypeScript
- Firebase (Auth, Firestore, Storage)
- Tailwind CSS
- React Hook Form + Zod

**Purpose:** Trainer dashboard for managing trainees and workouts

**Key Features:**
- Trainer authentication
- Trainee invitation system via email
- Trainee management dashboard
- Email service (development: mock, production: SMTP)
- Role-based access control

**Important Files:**
- `src/lib/firebase.ts` - Firebase configuration
- `src/lib/traineeService.ts` - Trainee management
- `src/lib/emailService.ts` - Email invitation system
- `src/app/signup/page.tsx` - Trainee signup with mobile redirect

**Environment Variables (Vercel):**
```
NEXT_PUBLIC_APP_URL=https://app.ryzup.me
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=fitness-platform-us-1759049736
```

---

### 3. **Mobile App (Trainee App)**
**Repository:** `Fitness Platform` (Monorepo)
**Location:** `/Users/avi/Desktop/Fitness Platform/apps/mobile`
**GitHub:** Part of monorepo on `develop` branch
**Deployment:** EAS Build (Expo)
**Distribution:** Google Play Store (Internal Testing)

**Tech Stack:**
- React Native (Expo)
- TypeScript
- Firebase (Auth, Firestore)
- Expo Router
- NativeWind

**Purpose:** Mobile app for trainees to view workouts and track progress

**Key Features:**
- Trainee authentication
- Direct Firestore queries (no REST API dependency)
- Workout viewing
- Progress tracking
- Deep linking support

**Important Files:**
- `apps/mobile/lib/firebase.ts` - Firebase config
- `apps/mobile/lib/auth.tsx` - Auth service + context
- `apps/mobile/lib/traineeService.ts` - Firestore trainee queries
- `apps/mobile/hooks/useTrainee.ts` - Trainee data hook
- `apps/mobile/app.json` - Expo configuration
- `apps/mobile/eas.json` - EAS Build configuration

**App Configuration:**
- Package: `com.ryzup.fitness`
- Bundle ID (iOS): `com.ryzup.fitness`
- Deep Link Scheme: `ryzup://`
- EAS Project ID: `d062c9d7-364d-4572-87a8-323455397e61`

**Build Profiles:**
- `development` - Debug builds for emulators
- `preview` - APK for internal testing
- `production` - AAB for Google Play Store

---

## 🔥 Firebase Configuration

**Project:** `fitness-platform-us-1759049736`
**Region:** US

### Firestore Collections:

1. **`trainers`** - Trainer profiles
   ```
   {
     id: string (document ID)
     email: string
     firstName: string
     lastName: string
     businessName?: string
     createdAt: timestamp
     updatedAt: timestamp
   }
   ```

2. **`trainees`** - Trainee profiles
   ```
   {
     id: string (document ID)
     userId: string (Firebase Auth UID)
     email: string
     firstName: string
     lastName: string
     trainerId: string (reference to trainer)
     status: 'pending' | 'active' | 'inactive'
     phone?: string
     invitationId?: string
     createdAt: timestamp
     updatedAt: timestamp
   }
   ```

3. **`trainee_invitations`** - Pending invitations
   ```
   {
     id: string (document ID)
     email: string
     firstName: string
     lastName: string
     trainerId: string
     invitationToken: string (unique)
     status: 'pending' | 'accepted' | 'expired'
     expiresAt: timestamp
     createdAt: timestamp
   }
   ```

4. **`users`** - Trainer user profiles (created during signup)
   ```
   {
     id: string (Firebase Auth UID)
     firstName: string
     lastName: string
     role: 'user'
     preferences: {...}
     createdAt: string
     lastLoginAt: string
   }
   ```

### Firebase Auth:
- Email/Password authentication
- Passwords encrypted by Firebase
- Used by both web and mobile apps

### Security Rules:
- Located in: `firestore.rules`
- Trainers can only access their own trainees
- Trainees can only access their own data

---

## 🔄 User Flow: Trainee Invitation

### Current Implementation:

1. **Trainer invites trainee** (Web Dashboard)
   - Creates record in `trainee_invitations` collection
   - Generates unique invitation token
   - Sends email with invitation link

2. **Invitation email**
   - Link format: `https://app.ryzup.me/signup?token={token}`
   - Email includes trainee name and trainer info

3. **Trainee clicks link**
   - **Mobile device:** Auto-detects → Redirects to app store
     - Tries deep link: `ryzup://invitation?token={token}`
     - Falls back to Google Play / App Store
   - **Desktop:** Shows web signup form (for trainers)

4. **Trainee signs up**
   - Creates Firebase Auth account
   - Updates trainee record with `userId`
   - Sets status to `active`
   - Marks invitation as `accepted`

5. **Trainee logs into mobile app**
   - Email: `{email}`
   - Password: `{password set during signup}`
   - Direct Firestore queries fetch trainee data

---

## 🚀 Deployment Setup

### Landing Page (ryzup.me)
**Platform:** Vercel
**Auto-deploy:** Push to `main` branch
**Custom Domain:** `ryzup.me`

**Steps to deploy:**
1. Push changes to GitHub
2. Vercel auto-builds and deploys
3. Live in ~2 minutes

---

### Web App (app.ryzup.me)
**Platform:** Vercel
**Auto-deploy:** Push to `main` branch
**Custom Domain:** `app.ryzup.me`

**Environment Variables Required:**
- `NEXT_PUBLIC_APP_URL=https://app.ryzup.me`
- All Firebase config variables

**Steps to deploy:**
1. Push changes to GitHub
2. Vercel auto-builds and deploys
3. Live in ~2 minutes

---

### Mobile App
**Platform:** EAS Build (Expo)
**Distribution:** Google Play Store

**Build Commands:**
```bash
# Preview build (APK for testing)
cd apps/mobile
eas build --platform android --profile preview

# Production build (AAB for Google Play)
eas build --platform android --profile production

# iOS build
eas build --platform ios --profile production
```

**Current Builds:**
- Preview APK: For internal testing on devices
- Production AAB: Ready for Google Play submission

**EAS Dashboard:**
https://expo.dev/accounts/aviisraeli/projects/ryzup/builds

---

## 📱 Mobile App Distribution

### Internal Testing (Current Phase)

**Test Account:**
- Email: `test@ryzup.me`
- Password: `avivAA87`

**Installation Methods:**
1. **Direct APK:** Download from EAS build link
2. **Google Play Internal Testing:** Via Play Console invitation

**Testing Documentation:**
- See: `GOOGLE_PLAY_TESTING.md`

---

## 🔑 Important Credentials & IDs

### Firebase
- Project ID: `fitness-platform-us-1759049736`
- Web API Key: `AIzaSyBv4edZFdKq5UieQchPC3SXjDtKXuUYsd0`

### Expo/EAS
- Owner: `aviisraeli`
- Project Slug: `ryzup`
- EAS Project ID: `d062c9d7-364d-4572-87a8-323455397e61`

### Android
- Package Name: `com.ryzup.fitness`
- Keystore: Managed by EAS (Build Credentials v9DWIbkRs8)

### iOS
- Bundle Identifier: `com.ryzup.fitness`

### Domains
- Main: `ryzup.me` (Landing)
- Web App: `app.ryzup.me` (Trainer Dashboard)

---

## 🛠️ Development Workflow

### Web Apps (Landing + Dashboard)
```bash
# Landing Page
cd /Users/avi/Desktop/fitness-platform-landing
npm run dev          # Start dev server
npm run build        # Build for production
git push origin main # Deploy to Vercel

# Web App (Dashboard)
cd /Users/avi/Desktop/fitness-platform-web-standalone
npm run dev          # Start dev server
npm run build        # Build for production
git push origin main # Deploy to Vercel
```

### Mobile App
```bash
cd "/Users/avi/Desktop/Fitness Platform/apps/mobile"
npx expo start       # Start development server
npx expo-doctor      # Validate configuration
eas build            # Build for distribution
```

---

## 🐛 Known Issues & Solutions

### Issue: Metro Config Errors
**Solution:** Use default Expo metro config (fixed in latest commit)

### Issue: Invitation link opens web app on mobile
**Solution:** Mobile detection added - auto-redirects to app store (implemented)

### Issue: Mobile app can't fetch trainee data (no REST API)
**Solution:** Direct Firestore queries implemented via TraineeService

### Issue: App crashed on install
**Solution:** Fixed app.json schema (intentFilters moved to android section)

---

## 📊 Current Status

### ✅ Completed
- [x] Landing page deployed to ryzup.me
- [x] Web app deployed to app.ryzup.me
- [x] Trainer authentication working
- [x] Trainee invitation system implemented
- [x] Email service configured (mock + production SMTP)
- [x] Mobile app authentication working
- [x] Mobile app Firestore integration
- [x] Mobile device detection and app store redirect
- [x] EAS build configuration fixed
- [x] Google Play testing documentation

### 🚧 In Progress
- [ ] Building preview APK (for device testing)
- [ ] Building production AAB (for Google Play)
- [ ] Google Play Console setup

### 📋 Next Steps
1. Test APK installation on device
2. Submit production build to Google Play
3. Set up internal testing in Play Console
4. Invite testers
5. Implement workout management features
6. Add trainee progress tracking
7. Build iOS version

---

## 📚 Important Documentation

- `/CLAUDE.md` - Project overview and instructions for Claude
- `/GOOGLE_PLAY_TESTING.md` - Testing guide for testers
- `/SYSTEM_OVERVIEW.md` - This file
- `apps/mobile/eas.json` - EAS build configuration
- `apps/mobile/app.json` - Expo app configuration

---

## 🔗 Quick Links

- **EAS Builds:** https://expo.dev/accounts/aviisraeli/projects/ryzup/builds
- **Landing Page:** https://ryzup.me
- **Web App:** https://app.ryzup.me
- **Firebase Console:** https://console.firebase.google.com/project/fitness-platform-us-1759049736

---

## 💡 Tips for Future Sessions

1. **To check build status:** Visit EAS dashboard or check background bash processes
2. **To rebuild apps:** Follow deployment steps in this doc
3. **To test invitation flow:** Create invitation in web dashboard, test on mobile
4. **To update Firebase rules:** Edit `firestore.rules` and deploy
5. **To add environment variables:** Update in Vercel dashboard (web apps)

---

**Project Contact:** Avi Israeli
**GitHub:** aviz85, aviisraeli, developer1087
**Email:** avi.israeli.dev@gmail.com

---

*Generated with [Claude Code](https://claude.com/claude-code) - October 2025*
