# Ryzup Fitness - Deployment & Development Workflow

**Last Updated:** October 16, 2025

## Repository Structure

### 1. Mobile App
- **GitHub Repo:** `fitness-platform` (https://github.com/developer1087/fitness-platform)
- **Local Path:** `/Users/avi/Desktop/Fitness Platform/`
- **Main Branch:** `main`
- **Development Branch:** `develop`
- **App Location:** `apps/mobile/`
- **Package:** `com.ryzup.fitness`

### 2. Web App (Trainer Dashboard)
- **GitHub Repo:** `fitness-platform-web` (https://github.com/developer1087/fitness-platform-web)
- **Local Path:** `/Users/avi/Desktop/fitness-platform-web-standalone/`
- **Domain:** `app.ryzup.me`
- **Deployment:** Vercel (auto-deploy on push)

### 3. Landing Page
- **GitHub Repo:** `fitness-platform-landing` (https://github.com/developer1087/-fitness-platform-landing)
- **Local Path:** `/Users/avi/Desktop/fitness-platform-landing/`
- **Domain:** `ryzup.me`
- **Deployment:** Vercel (auto-deploy on push)

---

## Current Deployment Methods

### Web App & Landing Page
✅ **Automated Vercel Deployment**
1. Make changes locally
2. Commit to git: `git add . && git commit -m "your message"`
3. Push to GitHub: `git push`
4. Vercel automatically builds and deploys
5. Check deployment status at https://vercel.com/dashboard

**Best Practice:**
- Always test locally first: `npm run dev`
- Use feature branches for new features
- Merge to `main` when ready for production

### Mobile App
⚠️ **Local Build Process** (EAS free tier exhausted)

**Current Method:**
```bash
cd "/Users/avi/Desktop/Fitness Platform/apps/mobile"
npx expo run:android --variant release
```

This builds an APK that you can install on Android devices.

**Important Notes:**
- Builds are done locally, not on EAS cloud
- APK is created in `android/app/build/outputs/apk/release/`
- Must rebuild after code changes to test
- Installation: Transfer APK to device via ADB or file transfer

---

## Git Workflow (NEW - Starting Today!)

### Branch Strategy

**Main Branch:**
- Contains production-ready code
- Only merge thoroughly tested features
- Always stable and deployable

**Develop Branch:**
- Active development happens here
- Merge feature branches when complete
- Test before merging to `main`

**Feature Branches:**
- Create for each new feature: `feature/feature-name`
- Branch from `develop`
- Merge back to `develop` when done
- Delete after merging

### Workflow Steps

#### 1. Starting a New Feature

```bash
# Make sure you're on develop and up to date
git checkout develop
git pull origin develop

# Create feature branch
git checkout -b feature/your-feature-name

# Work on your feature...
# Make commits as you go
git add .
git commit -m "feat: descriptive message"
```

#### 2. Completing a Feature

```bash
# Make sure feature branch is up to date with develop
git checkout develop
git pull origin develop
git checkout feature/your-feature-name
git merge develop

# Fix any conflicts if needed

# Push feature branch to GitHub
git push origin feature/your-feature-name

# Merge to develop when ready
git checkout develop
git merge feature/your-feature-name
git push origin develop

# Delete feature branch
git branch -d feature/your-feature-name
git push origin --delete feature/your-feature-name
```

#### 3. Deploying to Production

**For Web Apps:**
```bash
# Merge develop to main
git checkout main
git merge develop
git push origin main

# Vercel automatically deploys
```

**For Mobile App:**
```bash
# After merging to main, build fresh APK
cd "/Users/avi/Desktop/Fitness Platform/apps/mobile"

# Clean previous builds
rm -rf android/app/build

# Build release APK
npx expo run:android --variant release

# APK will be in: android/app/build/outputs/apk/release/
```

---

## Mobile App Build Process

### Prerequisites
- Android Studio installed
- Java JDK configured
- Environment variables set

### Build Commands

**Development Build (for testing):**
```bash
cd "/Users/avi/Desktop/Fitness Platform/apps/mobile"
npx expo run:android
```

**Release Build (for distribution):**
```bash
cd "/Users/avi/Desktop/Fitness Platform/apps/mobile"
npx expo run:android --variant release
```

**Clean Build (if issues occur):**
```bash
cd "/Users/avi/Desktop/Fitness Platform/apps/mobile"
cd android
./gradlew clean
cd ..
npx expo run:android --variant release
```

### Finding the APK

After successful build:
```bash
cd "/Users/avi/Desktop/Fitness Platform/apps/mobile/android/app/build/outputs/apk/release"
ls -lh  # Shows app-release.apk
```

### Installing APK on Device

**Via ADB:**
```bash
adb install app-release.apk
```

**Via File Transfer:**
1. Copy APK to device (USB, email, cloud storage)
2. Enable "Install from Unknown Sources" on device
3. Open APK file on device to install

---

## Common Issues & Solutions

### Issue: APK Missing Latest Features

**Cause:** Building from uncommitted code or cached build

**Solution:**
1. Commit all changes: `git add . && git commit -m "your message"`
2. Clean build: `cd android && ./gradlew clean`
3. Rebuild: `npx expo run:android --variant release`

### Issue: Web App Not Updating on Vercel

**Cause:** Code not pushed to GitHub

**Solution:**
1. Check git status: `git status`
2. Commit changes: `git add . && git commit -m "your message"`
3. Push to GitHub: `git push`
4. Check Vercel dashboard for deployment status

### Issue: Merge Conflicts

**Solution:**
1. Open conflicting files
2. Look for conflict markers: `<<<<<<<`, `=======`, `>>>>>>>`
3. Choose correct code or merge manually
4. Remove conflict markers
5. `git add .` and `git commit`

---

## Best Practices

### Before Every Coding Session
```bash
# Pull latest changes
git checkout develop
git pull origin develop

# Create feature branch
git checkout -b feature/your-feature
```

### During Development
- Commit frequently with descriptive messages
- Test changes locally before committing
- Keep commits focused on single changes

### Before Pushing
- Review your changes: `git diff`
- Test thoroughly
- Write clear commit messages
- Push to feature branch, not directly to develop/main

### Commit Message Format
```
feat: Add new feature
fix: Fix bug in feature
docs: Update documentation
style: Format code
refactor: Refactor code
test: Add tests
chore: Update dependencies
```

---

## Emergency Rollback

If something breaks in production:

**Web App:**
```bash
# Revert last commit
git revert HEAD
git push

# Or rollback in Vercel dashboard
```

**Mobile App:**
```bash
# Build from previous working commit
git checkout <previous-commit-hash>
npx expo run:android --variant release

# Then fix the issue in a new branch
git checkout develop
git checkout -b hotfix/fix-issue
```

---

## Monitoring & Logs

### Web App
- **Vercel Logs:** https://vercel.com/dashboard → Project → Deployments
- **Browser Console:** F12 in browser
- **Firebase Console:** https://console.firebase.google.com

### Mobile App
- **Device Logs:** `adb logcat` when device connected
- **Expo Logs:** Check terminal during development
- **Firebase Console:** https://console.firebase.google.com

---

## Current Status (October 16, 2025)

### Mobile App
✅ All code committed and pushed to GitHub (develop branch)
✅ Latest features included:
   - Session booking with payment integration
   - Real trainer data in messaging
   - Phone auth with correct SHA-1 fingerprint
   - Invoice and transaction creation

⏭️ Next: Clean build APK from committed code

### Web App
✅ Up to date on GitHub
✅ Messaging system implemented
✅ Auto-deploys via Vercel

### Landing Page
✅ Up to date on GitHub
✅ Auto-deploys via Vercel

---

## Quick Reference

### Mobile App Build
```bash
cd "/Users/avi/Desktop/Fitness Platform/apps/mobile"
npx expo run:android --variant release
```

### Web App Deploy
```bash
cd /Users/avi/Desktop/fitness-platform-web-standalone
git add . && git commit -m "your message" && git push
# Vercel auto-deploys
```

### Landing Page Deploy
```bash
cd /Users/avi/Desktop/fitness-platform-landing
git add . && git commit -m "your message" && git push
# Vercel auto-deploys
```

### Feature Branch Workflow
```bash
git checkout develop
git pull
git checkout -b feature/name
# ... work on feature ...
git add . && git commit -m "feat: description"
git push origin feature/name
# ... when ready ...
git checkout develop
git merge feature/name
git push
git branch -d feature/name
```
