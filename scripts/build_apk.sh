#!/bin/bash
# ==============================================================================
# CrimeNet Android APK Packaging Automation Script (Bash)
# ==============================================================================
set -e

echo "[CRIMENET] Initializing Android APK Build Pipeline..."

cd frontend

echo "[1/4] Building production React bundle with Vite..."
npm run build

echo "[2/4] Ensuring Capacitor CLI dependencies..."
npm install --save-dev @capacitor/core @capacitor/cli @capacitor/android

echo "[3/4] Initializing or Syncing Capacitor Android Project..."
if [ ! -d "android" ]; then
    echo "Adding Android native project platform..."
    npx cap add android
fi

echo "Syncing web build assets to Android project..."
npx cap sync android

echo "[4/4] Generating Debug APK via Gradle..."
cd android
if [ -f "./gradlew" ]; then
    chmod +x ./gradlew
    ./gradlew assembleDebug
    echo "[SUCCESS] APK compiled successfully!"
    echo "Location: frontend/android/app/build/outputs/apk/debug/app-debug.apk"
else
    echo "[NOTE] Open project in Android Studio: npx cap open android"
fi

cd ../..
echo "=============================================================================="
echo "CrimeNet APK build process completed."
echo "=============================================================================="
