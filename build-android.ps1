# Build Android APK - Automated Script

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "MandiApp - Android Build Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check prerequisites
Write-Host "[1/6] Checking prerequisites..." -ForegroundColor Yellow

# Check Node.js
$node = Get-Command node -ErrorAction SilentlyContinue
if (-not $node) {
    Write-Host "ERROR: Node.js not found!" -ForegroundColor Red
    Write-Host "Install from: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}
Write-Host "  Node.js: $($node.Version)" -ForegroundColor Green

# Check Java
$java = Get-Command java -ErrorAction SilentlyContinue
if (-not $java) {
    Write-Host "WARNING: Java not found!" -ForegroundColor Yellow
    Write-Host "Install JDK 17 from: https://www.oracle.com/java/technologies/downloads/" -ForegroundColor Yellow
} else {
    Write-Host "  Java: Found" -ForegroundColor Green
}

Write-Host ""

# Navigate to Frontend
Set-Location Frontend

# Step 2: Install dependencies
Write-Host "[2/6] Installing dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: npm install failed" -ForegroundColor Red
    exit 1
}
Write-Host "  Dependencies installed" -ForegroundColor Green
Write-Host ""

# Step 3: Build Angular app
Write-Host "[3/6] Building Angular app for production..." -ForegroundColor Yellow
Write-Host "  Using environment.prod.ts with Render API URLs" -ForegroundColor Cyan
npm run build -- --configuration=production
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Build failed" -ForegroundColor Red
    exit 1
}
Write-Host "  Angular app built successfully" -ForegroundColor Green
Write-Host ""

# Step 4: Sync with Capacitor
Write-Host "[4/6] Syncing with Capacitor..." -ForegroundColor Yellow
npx cap sync android
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Capacitor sync failed" -ForegroundColor Red
    exit 1
}
Write-Host "  Capacitor sync complete" -ForegroundColor Green
Write-Host ""

# Step 5: Check if Android Studio is installed
Write-Host "[5/6] Checking Android Studio..." -ForegroundColor Yellow
$androidStudio = Get-Command "C:\Program Files\Android\Android Studio\bin\studio64.exe" -ErrorAction SilentlyContinue

if ($androidStudio) {
    Write-Host "  Android Studio found" -ForegroundColor Green
    Write-Host ""
    
    $openStudio = Read-Host "Open Android Studio to build APK? (yes/no)"
    if ($openStudio -eq "yes") {
        Write-Host ""
        Write-Host "Opening Android Studio..." -ForegroundColor Cyan
        Write-Host ""
        Write-Host "IN ANDROID STUDIO:" -ForegroundColor Yellow
        Write-Host "  1. Wait for Gradle sync (5-10 minutes first time)" -ForegroundColor White
        Write-Host "  2. Build > Build Bundle(s) / APK(s) > Build APK(s)" -ForegroundColor White
        Write-Host "  3. APK will be at: android/app/build/outputs/apk/debug/app-debug.apk" -ForegroundColor White
        Write-Host ""
        
        npx cap open android
    }
} else {
    Write-Host "  Android Studio not found" -ForegroundColor Yellow
    Write-Host "  Install from: https://developer.android.com/studio" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "  Manual steps:" -ForegroundColor Cyan
    Write-Host "    1. Install Android Studio" -ForegroundColor White
    Write-Host "    2. Open: Frontend/android project" -ForegroundColor White
    Write-Host "    3. Build APK from Android Studio" -ForegroundColor White
}

Write-Host ""

# Step 6: Summary
Write-Host "[6/6] Build Summary" -ForegroundColor Yellow
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Build Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "API Endpoints Configured:" -ForegroundColor Yellow
Write-Host "  Identity: https://mandiapp-identity-api.onrender.com" -ForegroundColor White
Write-Host "  Marketplace: https://mandiapp-marketplace-api.onrender.com" -ForegroundColor White
Write-Host "  Ordering: https://mandiapp-ordering-api.onrender.com" -ForegroundColor White
Write-Host "  Logistics: https://mandiapp-logistics-hub.onrender.com" -ForegroundColor White
Write-Host ""

Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Build APK in Android Studio (if not already done)" -ForegroundColor White
Write-Host "  2. Test APK on your Android device" -ForegroundColor White
Write-Host "  3. Build signed AAB for Play Store release" -ForegroundColor White
Write-Host ""

Write-Host "Output Locations:" -ForegroundColor Yellow
Write-Host "  Debug APK: android/app/build/outputs/apk/debug/app-debug.apk" -ForegroundColor Cyan
Write-Host "  Release AAB: android/app/build/outputs/bundle/release/app-release.aab" -ForegroundColor Cyan
Write-Host ""

Write-Host "Documentation: ANDROID_DEPLOYMENT_GUIDE.md" -ForegroundColor Green
Write-Host ""

# Return to root
Set-Location ..
