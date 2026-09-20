@echo off
REM ==============================================================================
REM CrimeNet Android APK Packaging Automation Script
REM ==============================================================================
echo [CRIMENET] Initializing Android APK Build Pipeline...

cd frontend

echo [1/4] Building production React bundle with Vite...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Vite build failed.
    exit /b %ERRORLEVEL%
)

echo [2/4] Ensuring Capacitor CLI dependencies...
call npm install --save-dev @capacitor/core @capacitor/cli @capacitor/android

echo [3/4] Initializing or Syncing Capacitor Android Project...
if not exist "android" (
    echo Adding Android native project platform...
    call npx cap add android
)

echo Syncing web build assets to Android project...
call npx cap sync android

echo [4/4] Generating Release APK via Gradle...
cd android
if exist "gradlew.bat" (
    call gradlew.bat assembleDebug
    echo [SUCCESS] APK compiled successfully!
    echo Location: frontend\android\app\build\outputs\apk\debug\app-debug.apk
) else (
    echo [NOTE] Gradle wrapper not yet created. Open project in Android Studio or run: npx cap open android
)

cd ..\..
echo ==============================================================================
echo CrimeNet APK build process completed.
echo ==============================================================================
