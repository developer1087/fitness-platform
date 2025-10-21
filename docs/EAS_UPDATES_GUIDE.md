# EAS Updates Guide - Ryzup Fitness Mobile App

**Last Updated:** October 21, 2025

## Overview

EAS Updates allows you to push JavaScript and asset updates to your app instantly, without rebuilding and redistributing the APK. This is perfect for:
- Bug fixes
- UI/UX improvements
- New features (that don't require native code changes)
- Content updates

## How It Works

1. **Build once**: Create an APK with EAS Build
2. **Update often**: Push JavaScript updates with EAS Update
3. **Users get updates**: App checks for and downloads updates automatically

## Setup (Already Configured!)

✅ `expo-updates` package installed
✅ Update channels configured in `eas.json`
✅ Update URL configured in `app.json`
✅ Runtime version policy set to `appVersion`

## Build Profiles & Channels

### 1. **Development** (`development` channel)
```bash
eas build --profile development --platform android
```
- For internal testing
- Debug build
- Updates from `development` channel

### 2. **Preview** (`preview` channel)
```bash
eas build --profile preview --platform android
```
- **RECOMMENDED for testing**: Downloadable APK
- Internal distribution
- Updates from `preview` channel
- This is what you want for installing on your device!

### 3. **Production** (`production` channel)
```bash
eas build --profile production --platform android
```
- App Bundle (AAB) for Google Play Store
- Updates from `production` channel

## Step-by-Step: Build & Install APK on Device

### Step 1: Build Preview APK
```bash
# Make sure you're logged into EAS
eas login

# Build the APK (takes 10-15 minutes)
eas build --profile preview --platform android
```

### Step 2: Download & Install
1. Wait for build to complete
2. EAS will provide a download link
3. Download APK to your phone
4. Install the APK (enable "Install from unknown sources" if needed)

### Step 3: Push Updates (After Installing APK)
```bash
# Make your code changes first, then:

# Push update to preview channel
eas update --branch preview --message "Fixed login bug"

# The app will download the update on next launch!
```

## Common Workflows

### Workflow 1: Quick Bug Fix
```bash
# 1. Fix the bug in your code
# 2. Push the update
eas update --branch preview --message "Fix: Resolved authentication issue"

# 3. Restart your app - update downloads automatically!
```

### Workflow 2: New Feature (No Native Changes)
```bash
# 1. Develop your feature
# 2. Test locally with expo start
# 3. Push update
eas update --branch preview --message "Feature: Added workout history view"
```

### Workflow 3: Native Code Changed (Requires New Build)
```bash
# If you changed:
# - Native dependencies (installed new npm package with native code)
# - Android/iOS configuration
# - Permissions

# You need a new build:
eas build --profile preview --platform android
```

## Update Channels Explained

| Channel | Build Profile | Use Case |
|---------|--------------|----------|
| `development` | development | Internal dev testing |
| `preview` | preview | Beta testing (APK) |
| `production` | production | Play Store release |

## Checking for Updates

The app automatically checks for updates on launch. You can also implement manual checks:

```typescript
import * as Updates from 'expo-updates';

// Check for updates
const { isAvailable } = await Updates.checkForUpdateAsync();

if (isAvailable) {
  await Updates.fetchUpdateAsync();
  await Updates.reloadAsync(); // Restart app with new update
}
```

## Best Practices

### ✅ DO:
- Use EAS Updates for JavaScript/asset changes
- Test updates on preview channel before production
- Write descriptive update messages
- Keep track of which updates are on which channels

### ❌ DON'T:
- Try to update native code with EAS Updates
- Mix updates between different app versions
- Skip testing updates before pushing to production

## Monitoring Updates

### View Update History
```bash
# See all updates for preview channel
eas update:view --branch preview

# See all branches
eas branch:list
```

### Roll Back an Update
```bash
# Publish a previous update again
eas update:republish --branch preview --group <group-id>
```

## Troubleshooting

### Updates Not Downloading?
1. Check internet connection
2. Force close and reopen app
3. Verify you're on the correct channel:
   ```bash
   eas build:view <build-id>
   ```

### "No Updates Available"?
- Make sure you published to the correct branch
- Check runtime version compatibility
- Verify app is connected to internet

### Need New Native Build?
If you changed:
- Added/removed npm packages with native code
- Modified `app.json` native settings
- Changed Android/iOS permissions

→ Build new APK with `eas build`

## Useful Commands

```bash
# Login to EAS
eas login

# Build preview APK
eas build --profile preview --platform android

# Push update to preview
eas update --branch preview --message "Your update message"

# View recent builds
eas build:list --platform android

# View update history
eas update:view --branch preview

# Check EAS project info
eas project:info
```

## Current Configuration

**Project ID:** `d062c9d7-364d-4572-87a8-323455397e61`
**Owner:** `aviisraeli`
**Package:** `com.ryzup.fitness`
**Update URL:** `https://u.expo.dev/d062c9d7-364d-4572-87a8-323455397e61`

## Next Steps

1. **Build your first preview APK:**
   ```bash
   eas build --profile preview --platform android
   ```

2. **Install it on your device**

3. **Make a change and push an update:**
   ```bash
   eas update --branch preview --message "Test update"
   ```

4. **Restart your app** - the update downloads automatically!

## Links

- **EAS Builds:** https://expo.dev/accounts/aviisraeli/projects/ryzup/builds
- **EAS Updates:** https://expo.dev/accounts/aviisraeli/projects/ryzup/updates
- **Expo Docs:** https://docs.expo.dev/eas-update/introduction/
