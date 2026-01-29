# Render.com - 100% FREE Deployment
# No credit card, No charges EVER

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Render.com FREE Deployment Guide" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "RENDER FREE TIER:" -ForegroundColor Green
Write-Host "  - Unlimited services (FREE forever)" -ForegroundColor White
Write-Host "  - 512MB RAM per service" -ForegroundColor White
Write-Host "  - PostgreSQL database (90 days, then auto-delete)" -ForegroundColor White
Write-Host "  - Services sleep after 15min inactivity" -ForegroundColor Yellow
Write-Host "  - Wake up in ~30 seconds on first request" -ForegroundColor Yellow
Write-Host ""

Write-Host "BEST FOR: Testing, demos, low-traffic apps" -ForegroundColor Cyan
Write-Host ""

$continue = Read-Host "Continue with Render deployment? (yes/no)"
if ($continue -ne "yes") { exit 0 }

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "DEPLOYMENT STEPS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "[Step 1] Create Render Account" -ForegroundColor Yellow
Write-Host "  1. Go to: https://render.com" -ForegroundColor White
Write-Host "  2. Click 'Get Started'" -ForegroundColor White
Write-Host "  3. Sign up with GitHub (UpretiLalit)" -ForegroundColor White
Write-Host "  4. Authorize Render to access your repos" -ForegroundColor White
Write-Host ""

$step1 = Read-Host "Done? Press Enter to continue"

Write-Host ""
Write-Host "[Step 2] Create PostgreSQL Database" -ForegroundColor Yellow
Write-Host "  1. Click 'New +' > 'PostgreSQL'" -ForegroundColor White
Write-Host "  2. Name: mandiapp-db" -ForegroundColor White
Write-Host "  3. Database: mandiapp" -ForegroundColor White
Write-Host "  4. User: mandiapp" -ForegroundColor White
Write-Host "  5. Region: Singapore (closest to India)" -ForegroundColor White
Write-Host "  6. Select 'Free' plan" -ForegroundColor White
Write-Host "  7. Click 'Create Database'" -ForegroundColor White
Write-Host ""
Write-Host "  8. Copy 'Internal Database URL' (starts with postgresql://)" -ForegroundColor White
Write-Host ""

$dbUrl = Read-Host "Paste your Database URL here"

Write-Host ""
Write-Host "[Step 3] Deploy Identity API" -ForegroundColor Yellow
Write-Host "  1. Click 'New +' > 'Web Service'" -ForegroundColor White
Write-Host "  2. Connect repository: UpretiLalit/MandiApp" -ForegroundColor White
Write-Host "  3. Name: mandiapp-identity-api" -ForegroundColor White
Write-Host "  4. Region: Singapore" -ForegroundColor White
Write-Host "  5. Branch: master" -ForegroundColor White
Write-Host "  6. Root Directory: Backend" -ForegroundColor Cyan
Write-Host "  7. Docker Command: docker build -f Dockerfile.identity ." -ForegroundColor Cyan
Write-Host "  8. Environment: Docker" -ForegroundColor Cyan
Write-Host "  9. Instance Type: Free" -ForegroundColor White
Write-Host ""
Write-Host "  10. Add Environment Variables:" -ForegroundColor White
Write-Host "      ASPNETCORE_ENVIRONMENT = Production" -ForegroundColor Gray
Write-Host "      ConnectionStrings__DefaultConnection = $dbUrl;Database=MandiIdentityDB" -ForegroundColor Gray
Write-Host ""
Write-Host "  11. Click 'Create Web Service'" -ForegroundColor White
Write-Host ""
Write-Host "  NOTE: Build takes 5-10 minutes on first deploy" -ForegroundColor Yellow
Write-Host ""

$api1 = Read-Host "Identity API deployed? Press Enter to continue"

Write-Host ""
Write-Host "[Step 4] Deploy Marketplace API" -ForegroundColor Yellow
Write-Host "  Repeat Step 3 with these changes:" -ForegroundColor White
Write-Host "  - Name: mandiapp-marketplace-api" -ForegroundColor Cyan
Write-Host "  - Docker Command: docker build -f Dockerfile.marketplace ." -ForegroundColor Cyan
Write-Host "  - Database: MandiMarketplaceDB (in connection string)" -ForegroundColor Cyan
Write-Host ""

$api2 = Read-Host "Marketplace API deployed? Press Enter to continue"

Write-Host ""
Write-Host "[Step 5] Deploy Ordering API" -ForegroundColor Yellow
Write-Host "  Repeat Step 3 with these changes:" -ForegroundColor White
Write-Host "  - Name: mandiapp-ordering-api" -ForegroundColor Cyan
Write-Host "  - Root Directory: Backend" -ForegroundColor Cyan
Write-Host "  - Docker Command: docker build -f Dockerfile.ordering . -ForegroundColor Cyan
Write-Host ""

$api3 = Read-Host "Ordering API deployed? Press Enter to continue"

Write-Host ""
Write-Host "[Step 6] Deploy Logistics Hub" -ForegroundColor Yellow
Write-Host "  Repeat Step 3 with these changes:" -ForegroundColor White
Write-Host "  - Name: mandiapp-logistic" -ForegroundColor Cyan
Write-Host "  - Dockerfile Path: Services/Logistics.Hub/Dockerfile Cyan
Write-Host "  - Root Directory: Backend/Services/Logistics.Hub" -ForegroundColor Cyan
Write-Host "  - Database: MandiLogisticsDB (in connection string)" -ForegroundColor Cyan
Write-Host ""

$api4 = Read-Host "Logistics Hub deployed? Press Enter to continue"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Your APIs will be at:" -ForegroundColor Yellow
Write-Host "  https://mandiapp-identity-api.onrender.com" -ForegroundColor Cyan
Write-Host "  https://mandiapp-marketplace-api.onrender.com" -ForegroundColor Cyan
Write-Host "  https://mandiapp-ordering-api.onrender.com" -ForegroundColor Cyan
Write-Host "  https://mandiapp-logistics-hub.onrender.com" -ForegroundColor Cyan
Write-Host ""

Write-Host "NOTE: Free tier services sleep after 15min inactivity" -ForegroundColor Yellow
Write-Host "First request takes ~30 seconds to wake up" -ForegroundColor Yellow
Write-Host ""

Write-Host "Next: Create test users" -ForegroundColor Green
Write-Host "  .\create-test-users-api.ps1 -IdentityApiUrl https://mandiapp-identity-api.onrender.com" -ForegroundColor Cyan
Write-Host ""

$openRender = Read-Host "Open Render dashboard? (yes/no)"
if ($openRender -eq "yes") {
    Start-Process "https://dashboard.render.com"
}
