# Android APK Build & Play Store Deployment Guide

## Prerequisites

1. **Install Android Studio**
   - Download: https://developer.android.com/studio
   - Install Android SDK and build tools

2. **Install Java Development Kit (JDK 17)**
   - Download: https://www.oracle.com/java/technologies/downloads/

3. **Set Environment Variables**
   ```powershell
   # Add to system PATH:
   C:\Program Files\Android\Android Studio\jbr\bin
   C:\Users\YOUR_USERNAME\AppData\Local\Android\Sdk\platform-tools
   ```

---

## Build Steps

### Step 1: Update API Endpoints (Already Done!)

✅ Created `environment.prod.ts` with Render API URLs

### Step 2: Build Angular App

```powershell
cd Frontend

# Install dependencies (if not already done)
npm install

# Build for production
npm run build --configuration=production
```

### Step 3: Copy Build to Capacitor

```powershell
# Sync web build to native Android project
npx cap sync android
```

### Step 4: Open in Android Studio

```powershell
# Open Android project in Android Studio
npx cap open android
```

### Step 5: Build APK in Android Studio

1. **Wait for Gradle sync to complete** (first time takes 5-10 minutes)
2. **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**
3. APK will be saved to: `Frontend/android/app/build/outputs/apk/debug/app-debug.apk`

### Step 6: Build Signed APK for Play Store

1. **Build** → **Generate Signed Bundle / APK**
2. Select **Android App Bundle (AAB)** (required for Play Store)
3. Create or use existing keystore
4. Fill in keystore details and save securely

---

## Quick Build Script

Run this PowerShell script:

```powershell
.\build-android.ps1
```

---

## Play Store Deployment

### 1. Create Google Play Console Account
- Go to: https://play.google.com/console
- Pay $25 one-time registration fee

### 2. Create App Listing
- App name: **Mandi App**
- Category: **Business / Shopping**
- Add screenshots, description, icon

### 3. Upload AAB File
- Go to **Production** → **Create new release**
- Upload the `.aab` file from: `Frontend/android/app/build/outputs/bundle/release/`

### 4. Complete Store Listing
- **Short description** (80 chars max)
- **Full description** (4000 chars max)
- **Screenshots** (phone & tablet)
- **Feature graphic** (1024x500)
- **App icon** (512x512)
- **Privacy policy URL**

### 5. Content Rating
- Fill out content rating questionnaire
- Get rating certificate

### 6. Pricing & Distribution
- Select **Free** or **Paid**
- Choose countries to distribute

### 7. Submit for Review
- Review typically takes 3-7 days
- You'll receive email when approved

---

## App Details to Update

### Update Version in `capacitor.config.json`:
```json
{
  "appId": "com.mandiapp.mobile",
  "appName": "Mandi App",
  "version": "1.0.0"
}
```

### Update in `android/app/build.gradle`:
```gradle
android {
    defaultConfig {
        applicationId "com.mandiapp.mobile"
        versionCode 1
        versionName "1.0.0"
    }
}
```

---

## Testing Before Release

### Test APK on Real Device:
1. Enable **Developer Options** on your Android phone
2. Enable **USB Debugging**
3. Connect phone to computer
4. Run: `npx cap run android`

### Internal Testing on Play Store:
1. Create **Internal Testing** track
2. Upload AAB
3. Add testers by email
4. Share test link

---

## Automation Script

See `build-android.ps1` for automated build process!

---

## Common Issues & Solutions

### Issue: "SDK location not found"
**Solution:** Create `local.properties` in `Frontend/android/`:
```
sdk.dir=C\:\\Users\\YOUR_USERNAME\\AppData\\Local\\Android\\Sdk
```

### Issue: "Gradle sync failed"
**Solution:** Delete `Frontend/android/.gradle` folder and sync again

### Issue: "Capacitor not found"
**Solution:** Run `npm install @capacitor/cli @capacitor/core`

---

## Next Steps After Play Store Approval

1. Monitor crash reports in Play Console
2. Collect user feedback
3. Plan regular updates
4. Consider in-app updates using Capacitor plugins

---

## Important Files

- **APK (Testing):** `Frontend/android/app/build/outputs/apk/debug/app-debug.apk`
- **AAB (Play Store):** `Frontend/android/app/build/outputs/bundle/release/app-release.aab`
- **Keystore:** Keep this secure! You'll need it for all future updates
