# QR Scanner Setup Instructions

## Current Status
The QR scanner is currently in **MOCK MODE** for testing without a camera.

- `useMockScanner = true` (default) - Simulates successful scan after 500ms
- `useMockScanner = false` - Uses real device camera

## Install Real QR Scanner

### 1. Install Capacitor Barcode Scanner Plugin
```bash
npm install @capacitor-community/barcode-scanner
npx cap sync
```

### 2. Configure Android Permissions
Add to `android/app/src/main/AndroidManifest.xml`:
```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-feature android:name="android.hardware.camera" />
```

### 3. Configure iOS Permissions
Add to `ios/App/App/Info.plist`:
```xml
<key>NSCameraUsageDescription</key>
<string>We need camera access to scan vendor QR codes for pickup verification</string>
```

### 4. Enable Real Scanner
In `active-trip.page.ts`, change:
```typescript
useMockScanner: boolean = false; // Enable real camera
```

## How It Works

### Mock Mode (Current)
- Click "Scan QR" button
- Automatically succeeds after 500ms
- Row turns green with checkmark
- No camera required

### Real Camera Mode
1. Click "Scan QR" button
2. Requests camera permission (first time)
3. Opens camera viewfinder
4. Scans QR code from vendor's phone
5. Verifies QR matches expected vendor
6. If correct: Row turns green ✅
7. If wrong: Shows error "Wrong QR code!"

## QR Code Format
Expected format: `PICKUP-ORD-2026-001-VND-001`
- Contains order ID and vendor ID
- Vendor's phone should display this QR code
- Scanner verifies match before marking as scanned

## Testing
- **Mock Mode**: Works in browser and any device
- **Real Scanner**: Requires physical device with camera (won't work in browser or emulator without camera)

## Troubleshooting
- Camera not opening? Check permissions in device settings
- Wrong QR error? Ensure vendor QR matches expected format
- Scanner stuck? Call `stopScanner()` to reset
