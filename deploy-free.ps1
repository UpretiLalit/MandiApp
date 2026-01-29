# FREE Cloud Deployment for MandiApp
# 100% FREE using Vercel + Render + Supabase
# No credit card required!

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "MandiApp - 100% FREE Cloud Deployment" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "This deployment uses:" -ForegroundColor Green
Write-Host "  Frontend: Vercel (FREE unlimited)" -ForegroundColor White
Write-Host "  Backend: Render.com (FREE tier)" -ForegroundColor White
Write-Host "  Database: Supabase (FREE 500MB PostgreSQL)" -ForegroundColor White
Write-Host ""
Write-Host "Total Cost: $0/month FOREVER!" -ForegroundColor Green
Write-Host ""

$confirm = Read-Host "Continue with FREE deployment? (yes/no)"
if ($confirm -ne "yes") {
    Write-Host "Cancelled." -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Step 1: Database Setup (Supabase)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Go to: https://supabase.com" -ForegroundColor Yellow
Write-Host "2. Click 'Start your project'" -ForegroundColor Yellow
Write-Host "3. Sign in with GitHub (FREE)" -ForegroundColor Yellow
Write-Host "4. Click 'New project'" -ForegroundColor Yellow
Write-Host "5. Enter details:" -ForegroundColor Yellow
Write-Host "   - Name: mandiapp" -ForegroundColor White
Write-Host "   - Database Password: (create a strong password)" -ForegroundColor White
Write-Host "   - Region: Mumbai (or closest to you)" -ForegroundColor White
Write-Host "6. Click 'Create new project' (takes 2 minutes)" -ForegroundColor Yellow
Write-Host ""
Write-Host "7. Once created, go to Settings > Database" -ForegroundColor Yellow
Write-Host "8. Copy the 'Connection string' (URI format)" -ForegroundColor Yellow
Write-Host ""

$dbUrl = Read-Host "Paste your Supabase connection string here"

if (-not $dbUrl) {
    Write-Host "[ERROR] Database URL required!" -ForegroundColor Red
    exit 1
}

Write-Host "[OK] Database configured" -ForegroundColor Green

# Create .env file
$envContent = @"
# Supabase Database
DATABASE_URL=$dbUrl

# JWT Configuration (Auto-generated secure keys)
JWT_SECRET=$((-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 64 | ForEach-Object {[char]$_})))
JWT_ISSUER=https://mandiapp.onrender.com
JWT_AUDIENCE=https://mandiapp.onrender.com

# Environment
ASPNETCORE_ENVIRONMENT=Production
"@

Set-Content -Path ".env" -Value $envContent
Write-Host "[OK] Environment file created" -ForegroundColor Green

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Step 2: Backend Setup (Render.com)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Setting up Git repository first..." -ForegroundColor Yellow

# Check if git repo exists
if (-not (Test-Path ".git")) {
    Write-Host "Initializing Git repository..." -ForegroundColor Yellow
    git init
    git add .
    git commit -m "Initial commit for free deployment"
    Write-Host "[OK] Git repository initialized" -ForegroundColor Green
} else {
    Write-Host "[OK] Git repository already exists" -ForegroundColor Green
}

Write-Host ""
Write-Host "Now follow these steps:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Create GitHub Repository:" -ForegroundColor Cyan
Write-Host "   - Go to: https://github.com/new" -ForegroundColor White
Write-Host "   - Repository name: mandiapp" -ForegroundColor White
Write-Host "   - Make it Public (required for free tier)" -ForegroundColor White
Write-Host "   - Don't initialize with README" -ForegroundColor White
Write-Host "   - Click 'Create repository'" -ForegroundColor White
Write-Host ""
Write-Host "2. Push your code to GitHub:" -ForegroundColor Cyan

$githubUser = Read-Host "Enter your GitHub username"
Write-Host ""
Write-Host "Run these commands:" -ForegroundColor Yellow
Write-Host "git remote add origin https://github.com/$githubUser/mandiapp.git" -ForegroundColor Cyan
Write-Host "git branch -M main" -ForegroundColor Cyan
Write-Host "git push -u origin main" -ForegroundColor Cyan
Write-Host ""

$pushed = Read-Host "Have you pushed to GitHub? (yes/no)"
if ($pushed -ne "yes") {
    Write-Host "Please push to GitHub first, then run this script again." -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "3. Deploy Backend APIs on Render.com:" -ForegroundColor Cyan
Write-Host ""
Write-Host "   a) Go to: https://render.com" -ForegroundColor White
Write-Host "   b) Sign in with GitHub" -ForegroundColor White
Write-Host "   c) Click 'New +' > 'Web Service'" -ForegroundColor White
Write-Host ""
Write-Host "   d) Deploy each API (do this 4 times):" -ForegroundColor White
Write-Host ""
Write-Host "   API 1 - Identity API:" -ForegroundColor Yellow
Write-Host "     - Name: mandiapp-identity-api" -ForegroundColor White
Write-Host "     - Region: Singapore (or closest)" -ForegroundColor White
Write-Host "     - Branch: main" -ForegroundColor White
Write-Host "     - Root Directory: Backend/Services/Identity.API" -ForegroundColor White
Write-Host "     - Runtime: Docker" -ForegroundColor White
Write-Host "     - Instance Type: Free" -ForegroundColor White
Write-Host "     - Add Environment Variables:" -ForegroundColor White
Write-Host "       DATABASE_URL=$dbUrl" -ForegroundColor Cyan
Write-Host "       JWT_SECRET=(copy from .env file)" -ForegroundColor Cyan
Write-Host ""
Write-Host "   API 2 - Marketplace API:" -ForegroundColor Yellow
Write-Host "     - Name: mandiapp-marketplace-api" -ForegroundColor White
Write-Host "     - Root Directory: Backend/Services/Marketplace.API" -ForegroundColor White
Write-Host "     - (same settings as above)" -ForegroundColor White
Write-Host ""
Write-Host "   API 3 - Ordering API:" -ForegroundColor Yellow
Write-Host "     - Name: mandiapp-ordering-api" -ForegroundColor White
Write-Host "     - Root Directory: Backend/Services/Ordering.API" -ForegroundColor White
Write-Host "     - (same settings as above)" -ForegroundColor White
Write-Host ""
Write-Host "   API 4 - Logistics Hub:" -ForegroundColor Yellow
Write-Host "     - Name: mandiapp-logistics-hub" -ForegroundColor White
Write-Host "     - Root Directory: Backend/Services/Logistics.Hub" -ForegroundColor White
Write-Host "     - (same settings as above)" -ForegroundColor White
Write-Host ""

$renderDone = Read-Host "Have you deployed all 4 APIs on Render? (yes/no)"
if ($renderDone -ne "yes") {
    Write-Host "Complete the Render deployment first." -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "Enter your Render API URLs:" -ForegroundColor Cyan
$identityUrl = Read-Host "Identity API URL (e.g., https://mandiapp-identity-api.onrender.com)"
$marketplaceUrl = Read-Host "Marketplace API URL"
$orderingUrl = Read-Host "Ordering API URL"
$logisticsUrl = Read-Host "Logistics Hub URL"

# Update Frontend environment
Write-Host ""
Write-Host "Updating Frontend configuration..." -ForegroundColor Yellow

$frontendEnv = @"
export const environment = {
  production: true,
  apiUrl: '$marketplaceUrl/api',
  identityApiUrl: '$identityUrl/api',
  marketplaceApiUrl: '$marketplaceUrl/api',
  orderingApiUrl: '$orderingUrl/api',
  logisticsHubUrl: '$logisticsUrl',
  trackingHubUrl: '$logisticsUrl/hubs/tracking',
  priceHubUrl: '$marketplaceUrl/hubs/price',
  razorpayKeyId: 'rzp_test_Rt4HsYWkXkSWT4',
  useMockPayment: true,
  firebase: {
    apiKey: 'your-firebase-api-key',
    authDomain: 'your-app.firebaseapp.com',
    projectId: 'your-project-id',
    storageBucket: 'your-app.appspot.com',
    messagingSenderId: 'your-sender-id',
    appId: 'your-app-id'
  }
};
"@

Set-Content -Path "Frontend/src/environments/environment.prod.ts" -Value $frontendEnv
Write-Host "[OK] Frontend environment updated" -ForegroundColor Green

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Step 3: Frontend Setup (Vercel)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Building frontend..." -ForegroundColor Yellow

Push-Location Frontend
npm run build --prod
if ($LASTEXITCODE -eq 0) {
    Write-Host "[OK] Frontend built successfully" -ForegroundColor Green
} else {
    Write-Host "[ERROR] Frontend build failed" -ForegroundColor Red
    Pop-Location
    exit 1
}
Pop-Location

Write-Host ""
Write-Host "Now deploy to Vercel:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Go to: https://vercel.com" -ForegroundColor White
Write-Host "2. Sign in with GitHub" -ForegroundColor White
Write-Host "3. Click 'Add New' > 'Project'" -ForegroundColor White
Write-Host "4. Import your 'mandiapp' repository" -ForegroundColor White
Write-Host "5. Configure:" -ForegroundColor White
Write-Host "   - Framework Preset: Other" -ForegroundColor White
Write-Host "   - Root Directory: Frontend" -ForegroundColor White
Write-Host "   - Build Command: npm run build --prod" -ForegroundColor White
Write-Host "   - Output Directory: www" -ForegroundColor White
Write-Host "6. Click 'Deploy'" -ForegroundColor White
Write-Host ""

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Deployment Instructions Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Your FREE deployment stack:" -ForegroundColor Cyan
Write-Host ""
Write-Host "Database (Supabase):" -ForegroundColor Yellow
Write-Host "  $dbUrl" -ForegroundColor White
Write-Host ""
Write-Host "Backend APIs (Render):" -ForegroundColor Yellow
Write-Host "  Identity: $identityUrl" -ForegroundColor White
Write-Host "  Marketplace: $marketplaceUrl" -ForegroundColor White
Write-Host "  Ordering: $orderingUrl" -ForegroundColor White
Write-Host "  Logistics: $logisticsUrl" -ForegroundColor White
Write-Host ""
Write-Host "Frontend (Vercel):" -ForegroundColor Yellow
Write-Host "  Will be at: https://mandiapp-<your-username>.vercel.app" -ForegroundColor White
Write-Host ""
Write-Host "Total Cost: $0/month" -ForegroundColor Green
Write-Host ""
Write-Host "Important Notes:" -ForegroundColor Cyan
Write-Host "  - Render free tier sleeps after 15 min of inactivity" -ForegroundColor Yellow
Write-Host "  - First request after sleep takes 30-60 seconds" -ForegroundColor Yellow
Write-Host "  - 750 free hours/month per service (enough for 24/7)" -ForegroundColor Yellow
Write-Host "  - Vercel has unlimited bandwidth!" -ForegroundColor Yellow
Write-Host "  - Supabase gives 500MB database (expandable to 8GB free)" -ForegroundColor Yellow
Write-Host ""

# Save credentials
$credsContent = @"
FREE Deployment Credentials
============================

Deployment Date: $(Get-Date)

Database (Supabase):
  Connection String: $dbUrl
  Dashboard: https://app.supabase.com

Backend APIs (Render):
  Identity API: $identityUrl
  Marketplace API: $marketplaceUrl
  Ordering API: $orderingUrl
  Logistics Hub: $logisticsUrl
  Dashboard: https://dashboard.render.com

Frontend (Vercel):
  URL: Check https://vercel.com/dashboard
  GitHub Repo: https://github.com/$githubUser/mandiapp

Environment Variables (JWT):
$(Get-Content ".env")

Cost: $0/month (Forever Free!)

Limitations:
  - Render services sleep after 15 min inactivity
  - 750 hours/month per service (24/7 coverage)
  - Supabase: 500MB database, 2GB file storage
  - Vercel: Unlimited bandwidth, 100GB build minutes

"@

Set-Content -Path "deployment-credentials-free.txt" -Value $credsContent
Write-Host "Credentials saved to: deployment-credentials-free.txt" -ForegroundColor Green
Write-Host ""
