# Simple Railway Deployment for MandiApp
# Real-time production deployment

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Railway Production Deployment" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check authentication
Write-Host "[Step 1] Checking Railway authentication..." -ForegroundColor Yellow
railway whoami
if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "[ERROR] Not logged in!" -ForegroundColor Red
    Write-Host "Run: railway login --browserless" -ForegroundColor Yellow
    exit 1
}
Write-Host ""

# Step 2: Initialize project
Write-Host "[Step 2] Initializing Railway project..." -ForegroundColor Yellow
railway init
Write-Host ""

# Step 3: Add PostgreSQL
Write-Host "[Step 3] Adding PostgreSQL database..." -ForegroundColor Yellow
Write-Host "This will create a PostgreSQL database for your app" -ForegroundColor White
railway add
Write-Host ""

# Step 4: Show project info
Write-Host "[Step 4] Project status..." -ForegroundColor Yellow
railway status
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "DEPLOYMENT OPTIONS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Choose deployment method:" -ForegroundColor Yellow
Write-Host "  1. Deploy via GitHub (RECOMMENDED - automatic updates)" -ForegroundColor White
Write-Host "  2. Deploy via CLI (one-time deployment)" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Enter choice (1/2)"

if ($choice -eq "1") {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "GitHub Deployment Setup" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    
    Write-Host "Step 1: Push code to GitHub" -ForegroundColor Yellow
    Write-Host "  git add ." -ForegroundColor Cyan
    Write-Host "  git commit -m 'Railway deployment'" -ForegroundColor Cyan
    Write-Host "  git push origin main" -ForegroundColor Cyan
    Write-Host ""
    
    $pushNow = Read-Host "Push to GitHub now? (yes/no)"
    if ($pushNow -eq "yes") {
        git add .
        git commit -m "Railway deployment setup"
        git push origin main
    }
    
    Write-Host ""
    Write-Host "Step 2: Connect GitHub in Railway Dashboard" -ForegroundColor Yellow
    Write-Host "  1. Go to: https://railway.app/dashboard" -ForegroundColor White
    Write-Host "  2. Click 'New' > 'GitHub Repo'" -ForegroundColor White
    Write-Host "  3. Select your MandiApp repository" -ForegroundColor White
    Write-Host "  4. Deploy each service separately:" -ForegroundColor White
    Write-Host ""
    Write-Host "     Service 1: Identity API" -ForegroundColor Cyan
    Write-Host "     - Root Directory: Backend/Services/Identity.API" -ForegroundColor White
    Write-Host "     - Add variable: ASPNETCORE_URLS=http://0.0.0.0:5001" -ForegroundColor White
    Write-Host ""
    Write-Host "     Service 2: Marketplace API" -ForegroundColor Cyan
    Write-Host "     - Root Directory: Backend/Services/Marketplace.API" -ForegroundColor White
    Write-Host "     - Add variable: ASPNETCORE_URLS=http://0.0.0.0:5002" -ForegroundColor White
    Write-Host ""
    Write-Host "     Service 3: Ordering API" -ForegroundColor Cyan
    Write-Host "     - Root Directory: Backend/Services/Ordering.API" -ForegroundColor White
    Write-Host "     - Add variable: ASPNETCORE_URLS=http://0.0.0.0:5003" -ForegroundColor White
    Write-Host ""
    Write-Host "     Service 4: Logistics Hub" -ForegroundColor Cyan
    Write-Host "     - Root Directory: Backend/Services/Logistics.Hub" -ForegroundColor White
    Write-Host "     - Add variable: ASPNETCORE_URLS=http://0.0.0.0:5004" -ForegroundColor White
    Write-Host ""
    
    $openDashboard = Read-Host "Open Railway dashboard now? (yes/no)"
    if ($openDashboard -eq "yes") {
        Start-Process "https://railway.app/dashboard"
    }
    
} elseif ($choice -eq "2") {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "CLI Deployment" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    
    Write-Host "Deploy Identity API..." -ForegroundColor Yellow
    Push-Location "Backend\Services\Identity.API"
    railway up
    Pop-Location
    Write-Host ""
    
    Write-Host "Deploy Marketplace API..." -ForegroundColor Yellow
    Push-Location "Backend\Services\Marketplace.API"
    railway up
    Pop-Location
    Write-Host ""
    
    Write-Host "Deploy Ordering API..." -ForegroundColor Yellow
    Push-Location "Backend\Services\Ordering.API"
    railway up
    Pop-Location
    Write-Host ""
    
    Write-Host "Deploy Logistics Hub..." -ForegroundColor Yellow
    Push-Location "Backend\Services\Logistics.Hub"
    railway up
    Pop-Location
    Write-Host ""
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "NEXT STEPS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "1. Get your API URLs from Railway dashboard" -ForegroundColor Yellow
Write-Host "   https://railway.app/dashboard" -ForegroundColor Cyan
Write-Host ""

Write-Host "2. Create test users with real data:" -ForegroundColor Yellow
Write-Host "   .\create-test-users-api.ps1 -IdentityApiUrl https://your-identity-api.railway.app" -ForegroundColor Cyan
Write-Host ""

Write-Host "3. Test your APIs:" -ForegroundColor Yellow
Write-Host "   Invoke-WebRequest https://your-identity-api.railway.app/health" -ForegroundColor Cyan
Write-Host ""

Write-Host "4. Deploy Frontend to Vercel:" -ForegroundColor Yellow
Write-Host "   cd Frontend" -ForegroundColor Cyan
Write-Host "   vercel --prod" -ForegroundColor Cyan
Write-Host ""

Write-Host "[SUCCESS] Railway deployment initiated!" -ForegroundColor Green
Write-Host ""
