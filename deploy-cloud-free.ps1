# MandiApp - FREE Cloud Deployment (No Azure, No Throttling)
# Uses: Railway.app (FREE tier) - Better than Render for .NET
# 
# Railway FREE Tier:
# - $5 free credit/month (enough for small apps)
# - No throttling issues
# - Easy deployment from GitHub

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "MandiApp - FREE Cloud Deployment" -ForegroundColor Cyan
Write-Host "No Azure, No Throttling!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "DEPLOYMENT OPTIONS:" -ForegroundColor Yellow
Write-Host ""
Write-Host "Option 1: Railway.app (RECOMMENDED - $5/month free credit)" -ForegroundColor Green
Write-Host "  - Best for .NET APIs" -ForegroundColor White
Write-Host "  - PostgreSQL included" -ForegroundColor White
Write-Host "  - Deploy from GitHub in 2 minutes" -ForegroundColor White
Write-Host "  - No throttling issues" -ForegroundColor White
Write-Host ""
Write-Host "Option 2: Render.com (FREE forever)" -ForegroundColor Green
Write-Host "  - 512MB RAM per service" -ForegroundColor White
Write-Host "  - May sleep after 15min inactivity" -ForegroundColor White
Write-Host "  - Good for testing" -ForegroundColor White
Write-Host ""
Write-Host "Option 3: Local Development (Start immediately)" -ForegroundColor Green
Write-Host "  - Runs on your PC" -ForegroundColor White
Write-Host "  - Perfect for development" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Choose option (1/2/3)"

switch ($choice) {
    "1" {
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Cyan
        Write-Host "Railway.app Deployment Guide" -ForegroundColor Cyan
        Write-Host "========================================" -ForegroundColor Cyan
        Write-Host ""
        
        Write-Host "STEP 1: Create Railway Account" -ForegroundColor Yellow
        Write-Host "  1. Go to: https://railway.app" -ForegroundColor White
        Write-Host "  2. Click 'Login' and sign in with GitHub" -ForegroundColor White
        Write-Host "  3. You get $5 free credit/month automatically" -ForegroundColor White
        Write-Host ""
        
        Write-Host "STEP 2: Install Railway CLI" -ForegroundColor Yellow
        Write-Host "  Run this command:" -ForegroundColor White
        Write-Host "  npm install -g @railway/cli" -ForegroundColor Cyan
        Write-Host ""
        
        $installNow = Read-Host "Install Railway CLI now? (yes/no)"
        if ($installNow -eq "yes") {
            Write-Host "Installing Railway CLI..." -ForegroundColor Yellow
            npm install -g @railway/cli
        }
        
        Write-Host ""
        Write-Host "STEP 3: Login to Railway" -ForegroundColor Yellow
        Write-Host "  Run: railway login" -ForegroundColor Cyan
        Write-Host ""
        
        Write-Host "STEP 4: Create Project" -ForegroundColor Yellow
        Write-Host "  Run these commands:" -ForegroundColor White
        Write-Host "  railway init" -ForegroundColor Cyan
        Write-Host "  railway add --database postgresql" -ForegroundColor Cyan
        Write-Host ""
        
        Write-Host "STEP 5: Deploy Your APIs" -ForegroundColor Yellow
        Write-Host "  Railway will automatically detect .NET projects" -ForegroundColor White
        Write-Host "  Just push to GitHub and connect the repo!" -ForegroundColor White
        Write-Host ""
        
        Write-Host "[INFO] Full guide: https://docs.railway.app/guides/dotnet" -ForegroundColor Cyan
    }
    
    "2" {
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Cyan
        Write-Host "Render.com Deployment Guide" -ForegroundColor Cyan
        Write-Host "========================================" -ForegroundColor Cyan
        Write-Host ""
        
        Write-Host "STEP 1: Create Render Account" -ForegroundColor Yellow
        Write-Host "  1. Go to: https://render.com" -ForegroundColor White
        Write-Host "  2. Click 'Get Started' and sign up with GitHub" -ForegroundColor White
        Write-Host "  3. No credit card needed!" -ForegroundColor White
        Write-Host ""
        
        Write-Host "STEP 2: Create PostgreSQL Database" -ForegroundColor Yellow
        Write-Host "  1. Click 'New +' > 'PostgreSQL'" -ForegroundColor White
        Write-Host "  2. Name: mandiapp-db" -ForegroundColor White
        Write-Host "  3. Select 'Free' plan" -ForegroundColor White
        Write-Host "  4. Click 'Create Database'" -ForegroundColor White
        Write-Host "  5. Copy the 'Internal Database URL'" -ForegroundColor White
        Write-Host ""
        
        Write-Host "STEP 3: Deploy Each API" -ForegroundColor Yellow
        Write-Host "  For each API (Identity, Marketplace, Ordering, Logistics):" -ForegroundColor White
        Write-Host "  1. Click 'New +' > 'Web Service'" -ForegroundColor White
        Write-Host "  2. Connect your GitHub repository" -ForegroundColor White
        Write-Host "  3. Root Directory: Backend/Services/[ApiName]" -ForegroundColor White
        Write-Host "  4. Build Command: dotnet build" -ForegroundColor White
        Write-Host "  5. Start Command: dotnet run" -ForegroundColor White
        Write-Host "  6. Add environment variable:" -ForegroundColor White
        Write-Host "     ConnectionStrings__DefaultConnection = [your-db-url]" -ForegroundColor White
        Write-Host ""
        
        Write-Host "[INFO] Full guide available in FREE_DEPLOYMENT_GUIDE.md" -ForegroundColor Cyan
    }
    
    "3" {
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Cyan
        Write-Host "Local Development Setup" -ForegroundColor Cyan
        Write-Host "========================================" -ForegroundColor Cyan
        Write-Host ""
        
        Write-Host "Starting local development environment..." -ForegroundColor Yellow
        Write-Host ""
        
        # Check if PostgreSQL is installed
        $pgInstalled = Get-Command psql -ErrorAction SilentlyContinue
        
        if (-not $pgInstalled) {
            Write-Host "[WARN] PostgreSQL not found locally" -ForegroundColor Yellow
            Write-Host ""
            Write-Host "OPTIONS:" -ForegroundColor Cyan
            Write-Host "  A) Install PostgreSQL locally" -ForegroundColor White
            Write-Host "     Download: https://www.postgresql.org/download/windows/" -ForegroundColor White
            Write-Host ""
            Write-Host "  B) Use online PostgreSQL (Supabase - FREE)" -ForegroundColor White
            Write-Host "     1. Go to: https://supabase.com" -ForegroundColor White
            Write-Host "     2. Create project (takes 2 minutes)" -ForegroundColor White
            Write-Host "     3. Get connection string from Settings > Database" -ForegroundColor White
            Write-Host ""
            
            $dbChoice = Read-Host "Choose (A/B)"
            
            if ($dbChoice -eq "B") {
                Write-Host ""
                $supabaseUrl = Read-Host "Paste your Supabase connection string"
                
                # Update appsettings
                Write-Host ""
                Write-Host "Updating connection strings..." -ForegroundColor Yellow
                Write-Host "[TODO] You need to update appsettings.json in each API project" -ForegroundColor Yellow
                Write-Host "Location: Backend/Services/[ApiName]/appsettings.json" -ForegroundColor White
                Write-Host ""
            }
        }
        
        Write-Host ""
        Write-Host "Starting APIs..." -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Run these commands in separate terminals:" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Terminal 1 - Identity API:" -ForegroundColor Yellow
        Write-Host "  cd Backend\Services\Identity.API" -ForegroundColor White
        Write-Host "  dotnet run" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Terminal 2 - Marketplace API:" -ForegroundColor Yellow
        Write-Host "  cd Backend\Services\Marketplace.API" -ForegroundColor White
        Write-Host "  dotnet run" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Terminal 3 - Ordering API:" -ForegroundColor Yellow
        Write-Host "  cd Backend\Services\Ordering.API" -ForegroundColor White
        Write-Host "  dotnet run" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Terminal 4 - Logistics Hub:" -ForegroundColor Yellow
        Write-Host "  cd Backend\Services\Logistics.Hub" -ForegroundColor White
        Write-Host "  dotnet run" -ForegroundColor Cyan
        Write-Host ""
        
        Write-Host "[TIP] Or use the start-all-services.ps1 script!" -ForegroundColor Green
        Write-Host ""
        
        $startNow = Read-Host "Run start-all-services.ps1 now? (yes/no)"
        if ($startNow -eq "yes") {
            if (Test-Path ".\start-all-services.ps1") {
                & ".\start-all-services.ps1"
            } else {
                Write-Host "[ERROR] start-all-services.ps1 not found" -ForegroundColor Red
            }
        }
    }
    
    default {
        Write-Host "[ERROR] Invalid choice" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Need Help?" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Documentation:" -ForegroundColor Yellow
Write-Host "  - FREE_DEPLOYMENT_GUIDE.md (Detailed steps)" -ForegroundColor White
Write-Host "  - QUICK_START.md (Local development)" -ForegroundColor White
Write-Host "  - README.md (Overview)" -ForegroundColor White
Write-Host ""
Write-Host "Railway Guide: https://docs.railway.app/guides/dotnet" -ForegroundColor Cyan
Write-Host "Render Guide: https://render.com/docs/deploy-dotnet" -ForegroundColor Cyan
Write-Host ""
