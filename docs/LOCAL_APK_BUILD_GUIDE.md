# Local APK Build Guide - Ryzup Fitness

**Last Updated:** October 21, 2025

## ✅ Successfully Built Local Debug APK!

### APK Location:
```
~/Desktop/Ryzup-Fitness-DEBUG.apk
Size: 174 MB
Type: Debug Build (development)
```

## 📱 Installing the APK on Your Device

### Option 1: Transfer via USB (Recommended)

1. **Connect your Android device** to your computer via USB cable

2. **Enable USB File Transfer** on your phone:
   - When you connect, choose "File Transfer" or "MTP" mode
   - (Not "Charging only")

3. **Copy the APK**:
   ```bash
   # The APK is already on your Desktop
   # Just drag Ryzup-Fitness-DEBUG.apk to your phone's Downloads folder
   ```

4. **On your phone**:
   - Open the "Files" or "Downloads" app
   - Find `Ryzup-Fitness-DEBUG.apk`
   - Tap to install
   - You may need to enable "Install from Unknown Sources" for this app

### Option 2: Transfer via ADB (Developer Method)

```bash
# Install directly via ADB
adb install ~/Desktop/Ryzup-Fitness-DEBUG.apk

# Or if device is not recognized:
adb devices  # Make sure device shows up
adb install -r ~/Desktop/Ryzup-Fitness-DEBUG.apk  # -r for reinstall
```

### Option 3: Email/Cloud (Easy but Slower)

1. Email the APK to yourself
2. Open email on your phone
3. Download and install

### Option 4: Google Drive/Dropbox

1. Upload `Ryzup-Fitness-DEBUG.apk` to Drive/Dropbox
2. Download on your phone
3. Install from Downloads folder

## 🔧 Enabling "Install from Unknown Sources"

Since this is a debug APK (not from Play Store):

1. **Open Settings** on your Android device
2. Go to **Security** or **Apps**
3. Find **Install unknown apps** or **Special app access**
4. Select your **Files/Chrome/Email app** (whichever you're using to install)
5. Enable **Allow from this source**

## 🚀 Using the Local Build

### What's Different from Production:
- ✅ **Completely FREE** - no EAS build limits
- ✅ **Fast iteration** - rebuild locally anytime
- ✅ **Firebase connection** - uses production Firebase
- ✅ **EAS Updates enabled** - can still receive OTA updates!
- ⚠️ **Debug mode** - slightly larger file size, includes dev tools
- ⚠️ **Debug keystore** - different signing than production

### Updating the App:

You have TWO ways to update:

#### 1. **EAS Updates (OTA)** - For JavaScript changes:
```bash
# Make your code changes, then:
eas update --branch development --message "Fixed bug"

# Restart the app - update downloads automatically!
```

#### 2. **Rebuild Locally** - For native changes:
```bash
cd /Users/avi/Desktop/fitness-platform-mobile-app/android
./gradlew assembleDebug

# New APK will be at:
# android/app/build/outputs/apk/debug/app-debug.apk
```

## 📊 Build Details

### Build Configuration:
- **Package:** `com.ryzup.fitness`
- **Version:** 1.0.0
- **Min SDK:** 24 (Android 7.0)
- **Target SDK:** 36 (Android 15)
- **Build Type:** Debug
- **Keystore:** Debug keystore (auto-generated)

### Included Features:
- ✅ Firebase Auth (Phone + Email)
- ✅ Firestore Database
- ✅ Firebase Storage
- ✅ EAS Updates
- ✅ Expo Router
- ✅ React Native Firebase
- ✅ All app features

## 🔄 Rebuilding the APK

### Quick Rebuild:
```bash
cd /Users/avi/Desktop/fitness-platform-mobile-app/android
./gradlew assembleDebug

# Copy to Desktop:
cp app/build/outputs/apk/debug/app-debug.apk ~/Desktop/Ryzup-Fitness-DEBUG-NEW.apk
```

### Clean Rebuild (if issues):
```bash
cd /Users/avi/Desktop/fitness-platform-mobile-app/android
./gradlew clean
./gradlew assembleDebug
```

### Build Release APK (smaller, optimized):
```bash
cd /Users/avi/Desktop/fitness-platform-mobile-app/android
./gradlew assembleRelease

# APK will be at:
# app/build/outputs/apk/release/app-release-unsigned.apk
```

## 🐛 Troubleshooting

### "App not installed" error:
- Make sure you uninstalled any previous version
- Check if you have enough storage space
- Try: `adb install -r` to force reinstall

### "Parse error" when installing:
- APK might be corrupted during transfer
- Re-copy the APK
- Make sure you're using the correct architecture APK

### Build fails:
```bash
# Clean and rebuild:
cd android
./gradlew clean
rm -rf ~/.gradle/caches/
./gradlew assembleDebug
```

## 📦 APK Signing

### Debug vs Release:

**Debug APK (Current):**
- Signed with debug keystore
- Larger file size
- Includes dev tools
- Faster build time

**Release APK:**
- Requires production keystore
- Smaller, optimized
- No dev tools
- For Play Store or distribution

### To create a signed release APK:
See [EAS Build Guide](./EAS_UPDATES_GUIDE.md) - uses your production keystore from EAS.

## 🎯 Next Steps

1. **Install the APK** on your device using one of the methods above
2. **Test the app** - all features should work
3. **Make changes** to your code
4. **Either**:
   - Push OTA update: `eas update --branch development`
   - OR rebuild: `./gradlew assembleDebug`

## 💡 Pro Tips

- Keep the APK on your Desktop for easy access
- Build release APK when ready for wider testing
- Use EAS Updates for quick JavaScript fixes
- Rebuild locally for native code changes or new dependencies

## 🔗 Related Guides

- [EAS Updates Guide](./EAS_UPDATES_GUIDE.md) - For OTA updates
- [CLAUDE.md](../CLAUDE.md) - Project overview
- [SYSTEM_OVERVIEW.md](./SYSTEM_OVERVIEW.md) - Architecture details

---

**APK Built:** October 21, 2025
**Build Time:** ~4 minutes
**Build Tool:** Gradle 8.14.3
**Build Location:** `/Users/avi/Desktop/fitness-platform-mobile-app/android`
