# Fix Phone Authentication SHA Certificate Error

## Problem
Phone authentication is failing with SHA certificate error because Firebase requires the app's SHA-1 and SHA-256 fingerprints to be registered.

## Solution

### Option 1: Get SHA from EAS Expo Dashboard (EASIEST)

1. Go to: https://expo.dev/accounts/aviisraeli/projects/ryzup/credentials/android

2. Look for your keystore credentials

3. Click on the keystore to see SHA-1 and SHA-256 fingerprints

4. Copy both fingerprints

5. Add them to Firebase Console (see step 3 below)

### Option 2: Use Google Play Console (If uploaded to Play Store)

1. Open [Google Play Console](https://play.google.com/console)

2. Go to: Release → Setup → App Integrity

3. Copy the SHA-1 and SHA-256 certificate fingerprints

4. Add them to Firebase Console (see step 3 below)

### Option 3: Extract from APK manually

Run this command in your terminal:

```bash
cd "/Users/avi/Desktop/Fitness Platform/apps/mobile"

# Find apksigner (adjust path if needed)
find ~/Library/Android/sdk/build-tools -name apksigner | head -1

# Use the path from above to get certificates:
~/Library/Android/sdk/build-tools/YOUR_VERSION/apksigner verify --print-certs build-1760882297560.apk
```

Look for lines like:
```
SHA-1: XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX
SHA-256: XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX
```

---

## Step 3: Add Fingerprints to Firebase Console

1. Open Firebase Console:
   https://console.firebase.google.com/project/fitness-platform-us-1759049736/settings/general

2. Scroll down to **"Your apps"** section

3. Find the Android app: **com.ryzup.fitness**

4. Click **"Add fingerprint"** button

5. Paste the **SHA-1** fingerprint and save

6. Click **"Add fingerprint"** again

7. Paste the **SHA-256** fingerprint and save

8. **IMPORTANT:** Wait 5-10 minutes for changes to propagate to Firebase servers

9. Download the new `google-services.json`:
   - Click the settings gear icon next to your Android app
   - Click "Download google-services.json"
   - Replace the file at: `apps/mobile/google-services.json`

10. Rebuild the APK:
    ```bash
    cd "/Users/avi/Desktop/Fitness Platform/apps/mobile"
    rm -f *.apk
    eas build --platform android --profile preview --local
    ```

11. Install and test the new APK

---

## Verification

After adding SHA fingerprints, phone auth should work. If you still get errors:

1. Make sure you downloaded the new `google-services.json`
2. Verify phone auth is enabled in Firebase Console: Authentication → Sign-in method → Phone
3. Check that your phone number format is correct: `+972XXXXXXXXX`
4. Wait a bit longer (up to 15 minutes) for Firebase to sync

---

## Common Errors and Solutions

### "auth/missing-client-identifier"
- SHA certificates not configured in Firebase Console
- Solution: Follow steps above to add SHA-1 and SHA-256

### "auth/too-many-requests"
- Too many SMS verification attempts
- Solution: Wait 1-2 hours before trying again

### "auth/quota-exceeded"
- Firebase SMS quota exceeded (free tier: 10/day for testing)
- Solution: Upgrade Firebase plan or wait until quota resets

### "auth/invalid-phone-number"
- Phone number format is wrong
- Solution: Use format `+972XXXXXXXXX` (must include +972 country code)
