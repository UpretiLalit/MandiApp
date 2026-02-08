# 📱 Test Your Mobile App - 3 Quick Options

## Option 1: Run on Android Emulator (Fastest - No Phone Needed) ⚡

**In Android Studio:**

1. **Create Emulator** (if you don't have one):
   - Click **Device Manager** icon (phone icon) on right sidebar
   - Click **Create Virtual Device**
   - Select **Pixel 6** or any phone → **Next**
   - Download **Tiramisu (API 33)** if needed → **Next**
   - Click **Finish**

2. **Run App:**
   - Click green **Run** button ▶️ (or **Shift+F10**)
   - Select your emulator
   - Wait 30-60 seconds for emulator to start
   - App will install and launch automatically!

✅ **Done!** Your app is running in the emulator.

---

## Option 2: Run on Physical Phone (Real Device Testing) 📱

### Step 1: Enable Developer Mode on Your Phone

**Samsung/Most Android:**
1. Go to **Settings** → **About Phone**
2. Tap **Build Number** 7 times
3. You'll see "You are now a developer!"

### Step 2: Enable USB Debugging

1. Go to **Settings** → **Developer Options**
2. Turn on **USB Debugging**
3. Turn on **Install via USB** (if available)

### Step 3: Connect and Run

1. **Connect phone to PC via USB cable**
2. **On phone:** Allow USB debugging popup (check "Always allow")
3. **In Android Studio:** Click **Run** ▶️
4. **Select your phone** from device list
5. App installs and launches automatically!

✅ **Done!** App is running on your real phone.

---

## Option 3: Build APK and Install Manually 📦

### Build APK:

**In Android Studio:**
1. **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**
2. Wait 2-3 minutes
3. Click **locate** in the notification popup

**APK Location:**
```
D:\MandiApp\Frontend\android\app\build\outputs\apk\debug\app-debug.apk
```

### Install APK:

**Method A - Via USB:**
```powershell
cd Frontend/android
adb install app/build/outputs/apk/debug/app-debug.apk
```

**Method B - Transfer to Phone:**
1. Copy `app-debug.apk` to phone via USB or cloud
2. On phone, open the APK file
3. Allow "Install from Unknown Sources" if prompted
4. Click **Install**

---

## 🎯 Recommended for Testing:

**First Time?** → **Option 1** (Emulator - easiest setup)  
**Have Android Phone?** → **Option 2** (Real device - best testing)  
**Share with Others?** → **Option 3** (APK file)

---

## 🧪 What to Test:

### 1. **Login/Signup**
- Register new user
- Login with credentials
- Check JWT token authentication

### 2. **Marketplace**
- View commodity listings
- Search and filter
- Check prices loading from API

### 3. **Create Order**
- Select commodity
- Enter quantity
- Submit order

### 4. **Real-time Updates**
- Check SignalR connection to Logistics Hub
- Price updates
- Order status changes

### 5. **Offline Support**
- Turn off WiFi
- Check if cached data loads
- Turn on WiFi, verify sync

---

## 🐛 Troubleshooting:

### "Device not found"
- Check USB cable is data cable (not charge-only)
- Try different USB port
- Restart Android Studio

### "App keeps stopping"
- Check API endpoints are accessible
- Open Android Studio **Logcat** to see errors
- Verify CORS is enabled on backend

### "Cannot connect to API"
- Check phone is on same network OR
- APIs must be publicly accessible (your Render URLs are public ✅)
- Check internet connection on phone/emulator

---

## 📊 Check App is Working:

**Open Logcat in Android Studio:**
- View → Tool Windows → Logcat
- Filter by "Capacitor" to see app logs
- Check for API call logs

**Expected logs:**
```
✅ Capacitor: Initializing plugins
✅ HTTP: GET https://mandiapp-identity-api.onrender.com/api/...
✅ SignalR: Connected to logistics hub
```

---

## 🚀 Quick Start Command:

**Option 1 (Emulator):**
Just click **Run** ▶️ in Android Studio!

**Option 2 (Phone):**
```powershell
# Connect phone, enable USB debugging, then:
cd D:\MandiApp\Frontend
npx cap run android
```

---

## 🎉 Success!

Your app should now be running and connecting to your Render.com APIs!

**API Endpoints (auto-configured):**
- Identity: https://mandiapp-identity-api.onrender.com
- Marketplace: https://mandiapp-marketplace-api.onrender.com
- Ordering: https://mandiapp-ordering-api.onrender.com
- Logistics: https://mandiapp-logistics-hub.onrender.com

Happy testing! 📱✨
