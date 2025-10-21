#!/bin/bash

echo "========================================="
echo "📱 Getting SHA Fingerprints for Firebase"
echo "========================================="
echo ""

# Get the APK file (most recent)
APK_FILE=$(ls -t *.apk 2>/dev/null | head -1)

if [ -z "$APK_FILE" ]; then
  echo "❌ No APK file found in current directory"
  echo "   Please build an APK first using: eas build --platform android --profile preview --local"
  exit 1
fi

echo "📦 Found APK: $APK_FILE"
echo ""

# Extract signing certificate from APK
echo "🔐 Extracting signing certificate..."
echo ""

# Use apksigner to get certificate fingerprints
if command -v apksigner &> /dev/null; then
  echo "Using apksigner..."
  apksigner verify --print-certs "$APK_FILE" | grep -E "SHA-1|SHA-256"
elif command -v keytool &> /dev/null && command -v jarsigner &> /dev/null; then
  # Alternative method using keytool
  echo "Using keytool..."

  # Extract META-INF/CERT.RSA from APK
  unzip -p "$APK_FILE" META-INF/*.RSA 2>/dev/null > /tmp/cert.rsa

  if [ -f /tmp/cert.rsa ]; then
    keytool -printcert -file /tmp/cert.rsa | grep -E "SHA1|SHA256"
    rm /tmp/cert.rsa
  else
    echo "❌ Could not extract certificate from APK"
  fi
else
  echo "❌ Neither apksigner nor keytool found"
  echo "   Install Android SDK build tools"
fi

echo ""
echo "========================================="
echo "📋 Next Steps:"
echo "========================================="
echo ""
echo "1. Copy the SHA-1 and SHA-256 fingerprints above"
echo ""
echo "2. Go to Firebase Console:"
echo "   https://console.firebase.google.com/project/fitness-platform-us-1759049736/settings/general"
echo ""
echo "3. Scroll down to 'Your apps' → Android app (com.ryzup.fitness)"
echo ""
echo "4. Click 'Add fingerprint' and paste BOTH:"
echo "   - SHA-1 fingerprint"
echo "   - SHA-256 fingerprint"
echo ""
echo "5. Save and wait ~5 minutes for changes to propagate"
echo ""
echo "6. Rebuild and test the app"
echo ""
