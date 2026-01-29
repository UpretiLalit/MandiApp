# Railway Deployment Script for MandiApp
# Real-time deployment with user test data

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Railway Production Deployment" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Railway CLI is logged in
Write-Host "[1/7] Checking Railway authentication..." -ForegroundColor Yellow
try {
    $railwayCheck = railway whoami 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERROR] Not logged in to Railway" -ForegroundColor Red
        Write-Host "Run: railway login --browserless" -ForegroundColor Yellow
        exit 1
    }
} catch {
    Write-Host "[ERROR] Railway CLI not found or not logged in" -ForegroundColor Red
    exit 1
}

Write-Host "Logged in successfully" -ForegroundColor Green
Write-Host ""

# Initialize Railway project
Write-Host "[2/7] Initializing Railway project..." -ForegroundColor Yellow
Write-Host ""

try {
    $projectExists = railway status 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Creating new Railway project: MandiApp" -ForegroundColor Cyan
        railway init --name "MandiApp"
    } else {
        Write-Host "Project already initialized" -ForegroundColor Green
    }
} catch {
    Write-Host "Creating new Railway project: MandiApp" -ForegroundColor Cyan
    railway init --name "MandiApp"
}

Write-Host ""

# Add PostgreSQL database
Write-Host "[3/7] Setting up PostgreSQL database..." -ForegroundColor Yellow
Write-Host ""

Write-Host "Adding PostgreSQL..." -ForegroundColor Cyan
railway add --database postgresql

Write-Host ""
Write-Host "Database created!" -ForegroundColor Green
Write-Host ""

# Get database connection string
Write-Host "[4/7] Getting database connection string..." -ForegroundColor Yellow
try {
    $dbUrl = railway variables get DATABASE_URL 2>&1
    if ($dbUrl) {
        Write-Host "Database URL obtained" -ForegroundColor Green
        Write-Host ""
    }
} catch {
    Write-Host "[WARN] Could not get DATABASE_URL automatically" -ForegroundColor Yellow
    Write-Host "You can get it from Railway dashboard" -ForegroundColor White
    Write-Host ""
}

# Create deployment configuration for each service
Write-Host "[5/7] Creating deployment configurations..." -ForegroundColor Yellow
Write-Host ""

# Check which services exist
$services = @()
if (Test-Path "Backend\Services\Identity.API") {
    $services += @{Name="Identity.API"; Path="Backend/Services/Identity.API"; Port=5001}
}
if (Test-Path "Backend\Services\Marketplace.API") {
    $services += @{Name="Marketplace.API"; Path="Backend/Services/Marketplace.API"; Port=5002}
}
if (Test-Path "Backend\Services\Ordering.API") {
    $services += @{Name="Ordering.API"; Path="Backend/Services/Ordering.API"; Port=5003}
}
if (Test-Path "Backend\Services\Logistics.Hub") {
    $services += @{Name="Logistics.Hub"; Path="Backend/Services/Logistics.Hub"; Port=5004}
}

Write-Host "Found $($services.Count) services to deploy:" -ForegroundColor Cyan
foreach ($svc in $services) {
    Write-Host "  - $($svc.Name)" -ForegroundColor White
}
Write-Host ""

# Create railway.json for each service
foreach ($svc in $services) {
    $railwayConfig = @{
        build = @{
            builder = "NIXPACKS"
            buildCommand = "dotnet restore && dotnet build -c Release"
        }
        deploy = @{
            startCommand = "dotnet run --no-build -c Release"
            restartPolicyType = "ON_FAILURE"
            restartPolicyMaxRetries = 3
        }
    } | ConvertTo-Json -Depth 10
    
    $configPath = "$($svc.Path)\railway.json"
    $railwayConfig | Out-File -FilePath $configPath -Encoding UTF8
    Write-Host "Created config for $($svc.Name)" -ForegroundColor Green
}

Write-Host ""

# Create environment variables template
Write-Host "[6/7] Setting up environment variables..." -ForegroundColor Yellow
Write-Host ""

$envTemplate = @"
# Environment Variables for Railway Deployment
# Copy these to Railway dashboard for each service

# Identity API
ASPNETCORE_ENVIRONMENT=Production
ConnectionStrings__DefaultConnection=`${DATABASE_URL};Database=MandiIdentityDB
ASPNETCORE_URLS=http://0.0.0.0:5001

# Marketplace API
ASPNETCORE_ENVIRONMENT=Production
ConnectionStrings__DefaultConnection=`${DATABASE_URL};Database=MandiMarketplaceDB
IdentityApiUrl=https://your-identity-api.railway.app
ASPNETCORE_URLS=http://0.0.0.0:5002

# Ordering API
ASPNETCORE_ENVIRONMENT=Production
ConnectionStrings__DefaultConnection=`${DATABASE_URL};Database=MandiOrderingDB
IdentityApiUrl=https://your-identity-api.railway.app
MarketplaceApiUrl=https://your-marketplace-api.railway.app
ASPNETCORE_URLS=http://0.0.0.0:5003

# Logistics Hub
ASPNETCORE_ENVIRONMENT=Production
ConnectionStrings__DefaultConnection=`${DATABASE_URL};Database=MandiLogisticsDB
OrderingApiUrl=https://your-ordering-api.railway.app
ASPNETCORE_URLS=http://0.0.0.0:5004
"@

$credentials | Out-File -FilePath "railway-env-template.txt" -Encoding UTF8
Write-Host "Created environment template: railway-env-template.txt" -ForegroundColor Green
Write-Host ""

# Deploy instructions
Write-Host "[7/7] Deployment Instructions" -ForegroundColor Yellow
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "NEXT STEPS - Deploy via Railway Dashboard" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Option A: Deploy via GitHub (RECOMMENDED)" -ForegroundColor Green
Write-Host "1. Push your code to GitHub:" -ForegroundColor Yellow
Write-Host "   git add ." -ForegroundColor White
Write-Host "   git commit -m 'Railway deployment setup'" -ForegroundColor White
Write-Host "   git push origin main" -ForegroundColor White
Write-Host ""
Write-Host "2. Go to Railway Dashboard:" -ForegroundColor Yellow
Write-Host "   https://railway.app/dashboard" -ForegroundColor Cyan
Write-Host ""
Write-Host "3. For each service (Identity, Marketplace, Ordering, Logistics):" -ForegroundColor Yellow
Write-Host "   a) Click 'New' > 'GitHub Repo'" -ForegroundColor White
Write-Host "   b) Select your MandiApp repository" -ForegroundColor White
Write-Host "   c) Set Root Directory: Backend/Services/[ServiceName]" -ForegroundColor White
Write-Host "   d) Add environment variables from railway-env-template.txt" -ForegroundColor White
Write-Host "   e) Click 'Deploy'" -ForegroundColor White
Write-Host ""

Write-Host "Option B: Deploy via Railway CLI" -ForegroundColor Green
Write-Host "Deploy each service:" -ForegroundColor Yellow
Write-Host "   cd Backend\Services\Identity.API" -ForegroundColor White
Write-Host "   railway up" -ForegroundColor White
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "DATABASE SETUP & TEST DATA" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "After deployment, seed test data:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Get database connection from Railway:" -ForegroundColor White
Write-Host "   railway variables get DATABASE_URL" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. Connect and run migrations:" -ForegroundColor White
Write-Host "   - Identity API will auto-create tables on first run" -ForegroundColor White
Write-Host "   - Or manually run: .\run-migration.ps1" -ForegroundColor White
Write-Host ""
Write-Host "3. Create test users via API:" -ForegroundColor White
Write-Host "   POST https://your-identity-api.railway.app/api/auth/register" -ForegroundColor Cyan
Write-Host ""
Write-Host "4. Seed marketplace data:" -ForegroundColor White
Write-Host "   Use: .\test-apis.ps1 (update with Railway URLs)" -ForegroundColor White
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "TEST YOUR DEPLOYMENT" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "After all services are deployed:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Get your API URLs from Railway dashboard" -ForegroundColor White
Write-Host "2. Update Frontend environment:" -ForegroundColor White
Write-Host "   Frontend/.env.production" -ForegroundColor Cyan
Write-Host ""
Write-Host "3. Test APIs:" -ForegroundColor White
Write-Host "   Invoke-WebRequest https://your-identity-api.railway.app/health" -ForegroundColor Cyan
Write-Host ""
Write-Host "4. Deploy Frontend to Vercel:" -ForegroundColor White
Write-Host "   cd Frontend" -ForegroundColor Cyan
Write-Host "   npm install -g vercel" -ForegroundColor Cyan
Write-Host "   vercel --prod" -ForegroundColor Cyan
Write-Host ""

Write-Host "[SUCCESS] Railway setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Documentation:" -ForegroundColor Yellow
Write-Host "  - railway-env-template.txt (Environment variables)" -ForegroundColor White
Write-Host "  - Railway Guide: https://docs.railway.app/guides/dotnet" -ForegroundColor Cyan
Write-Host ""

# Offer to open Railway dashboard
$openDashboard = Read-Host "Open Railway dashboard now? (yes/no)"
if ($openDashboard -eq "yes") {
    Start-Process "https://railway.app/dashboard"
}

Write-Host ""
Write-Host "Ready to deploy! Follow the steps above." -ForegroundColor Green
Write-Host ""
