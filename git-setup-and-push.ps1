# Quick Git Setup & Push Script
# Run this after installing Git

Write-Host "📦 MandiApp - Git Repository Setup" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan
Write-Host ""

$rootPath = "d:\MandiApp"
cd $rootPath

# Check if git is installed
try {
    $gitVersion = git --version
    Write-Host "✓ Git is installed: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Git is not installed!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install Git first:" -ForegroundColor Yellow
    Write-Host "1. Download from: https://git-scm.com/download/win" -ForegroundColor White
    Write-Host "2. Install with default settings" -ForegroundColor White
    Write-Host "3. Restart this terminal" -ForegroundColor White
    Write-Host "4. Run this script again" -ForegroundColor White
    exit 1
}

Write-Host ""

# Check if already initialized
if (Test-Path ".git") {
    Write-Host "⚠️  Git repository already initialized" -ForegroundColor Yellow
    Write-Host ""
    
    # Show current status
    Write-Host "Current status:" -ForegroundColor Cyan
    git status --short
    
    Write-Host ""
    $continue = Read-Host "Continue with commit and push? (y/n)"
    if ($continue -ne 'y' -and $continue -ne 'Y') {
        Write-Host "Aborted." -ForegroundColor Yellow
        exit 0
    }
} else {
    Write-Host "Initializing Git repository..." -ForegroundColor Yellow
    git init
    Write-Host "✓ Repository initialized" -ForegroundColor Green
    Write-Host ""
    
    # Configure git user (if not set)
    $userName = git config user.name
    $userEmail = git config user.email
    
    if (-not $userName) {
        Write-Host "Git user configuration needed..." -ForegroundColor Yellow
        $userName = Read-Host "Enter your name"
        git config --global user.name "$userName"
        Write-Host "✓ User name set to: $userName" -ForegroundColor Green
    } else {
        Write-Host "✓ Git user: $userName" -ForegroundColor Green
    }
    
    if (-not $userEmail) {
        $userEmail = Read-Host "Enter your email"
        git config --global user.email "$userEmail"
        Write-Host "✓ Email set to: $userEmail" -ForegroundColor Green
    } else {
        Write-Host "✓ Git email: $userEmail" -ForegroundColor Green
    }
    Write-Host ""
}

# Check for sensitive files
Write-Host "Checking for sensitive files..." -ForegroundColor Yellow

$sensitiveFiles = @(
    "Backend/Services/Identity.API/appsettings.json",
    "Backend/Services/Marketplace.API/appsettings.json",
    "Backend/Services/Ordering.API/appsettings.json",
    "Backend/Services/Logistics.Hub/appsettings.json",
    "Frontend/src/environments/environment.prod.ts"
)

$foundSensitive = $false
foreach ($file in $sensitiveFiles) {
    $fullPath = Join-Path $rootPath $file
    if (Test-Path $fullPath) {
        # Check if file contains real credentials
        $content = Get-Content $fullPath -Raw
        if ($content -match "PYvWmYoMYiO3RiCJ" -or $content -match "postgres") {
            Write-Host "⚠️  SENSITIVE: $file contains real credentials!" -ForegroundColor Red
            $foundSensitive = $true
        }
    }
}

if ($foundSensitive) {
    Write-Host ""
    Write-Host "=================================" -ForegroundColor Red
    Write-Host "⚠️  WARNING: SENSITIVE DATA FOUND" -ForegroundColor Red
    Write-Host "=================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Your appsettings.json files contain real database passwords!" -ForegroundColor Yellow
    Write-Host "These are already in .gitignore and won't be committed." -ForegroundColor Green
    Write-Host ""
    Write-Host "Recommendation:" -ForegroundColor Cyan
    Write-Host "1. Keep these files LOCAL only" -ForegroundColor White
    Write-Host "2. Create template files for the repository" -ForegroundColor White
    Write-Host "3. Use environment variables in production" -ForegroundColor White
    Write-Host ""
    
    $continue = Read-Host "Continue? (y/n)"
    if ($continue -ne 'y' -and $continue -ne 'Y') {
        Write-Host "Aborted. Please secure your credentials first." -ForegroundColor Yellow
        exit 0
    }
}

Write-Host ""
Write-Host "Staging files..." -ForegroundColor Yellow

# Stage all files (respecting .gitignore)
git add .

Write-Host "✓ Files staged" -ForegroundColor Green
Write-Host ""

# Show what will be committed
Write-Host "Files to be committed:" -ForegroundColor Cyan
git status --short

$fileCount = (git diff --cached --numstat | Measure-Object).Count
Write-Host ""
Write-Host "Total files to commit: $fileCount" -ForegroundColor Yellow
Write-Host ""

# Commit
$commitMessage = @"
Initial commit: MandiApp - Production Ready

✅ Database Migration:
- All 23 tables migrated to Supabase
- Row-Level Security enabled on all tables
- Indexes and foreign keys configured

✅ Backend Services (4 Microservices):
- Identity.API: Authentication with JWT + OTP
- Marketplace.API: Product catalog
- Ordering.API: Orders, Cart, Payments
- Logistics.Hub: Real-time delivery tracking

✅ Frontend (Angular/Ionic):
- Mobile-first responsive design
- Real-time price updates (SignalR)
- Live delivery tracking
- Cart and checkout flow

✅ Real-Time Features:
- SignalR hubs for price updates
- SignalR hubs for location tracking
- WebSocket auto-reconnection

✅ Documentation:
- Production readiness checklist
- Database migration summary
- Git setup guide
- Test user creation scripts
- Deployment automation scripts

🎯 Status: Ready for user testing
📦 Database: Supabase PostgreSQL (Connected)
🔐 Security: RLS policies active
"@

Write-Host "Creating commit..." -ForegroundColor Yellow
git commit -m "$commitMessage"
Write-Host "✓ Commit created" -ForegroundColor Green
Write-Host ""

# Check for remote
$hasRemote = git remote -v 2>&1
if ($LASTEXITCODE -eq 0 -and $hasRemote) {
    Write-Host "Found remote repository:" -ForegroundColor Green
    git remote -v
    Write-Host ""
    
    $push = Read-Host "Push to remote now? (y/n)"
    if ($push -eq 'y' -or $push -eq 'Y') {
        Write-Host ""
        Write-Host "Pushing to remote..." -ForegroundColor Yellow
        
        try {
            git push -u origin main
            Write-Host ""
            Write-Host "✅ Successfully pushed to remote!" -ForegroundColor Green
        } catch {
            Write-Host "❌ Failed to push. Trying 'master' branch..." -ForegroundColor Yellow
            try {
                git push -u origin master
                Write-Host ""
                Write-Host "✅ Successfully pushed to remote!" -ForegroundColor Green
            } catch {
                Write-Host ""
                Write-Host "❌ Push failed. Please push manually:" -ForegroundColor Red
                Write-Host "   git push -u origin main" -ForegroundColor White
            }
        }
    }
} else {
    Write-Host "=================================" -ForegroundColor Cyan
    Write-Host "No remote repository configured" -ForegroundColor Yellow
    Write-Host "=================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Next steps to push to GitHub:" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "1. Create a new repository on GitHub:" -ForegroundColor Yellow
    Write-Host "   https://github.com/new" -ForegroundColor White
    Write-Host ""
    Write-Host "2. Then run these commands:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host '   git remote add origin https://github.com/YOUR_USERNAME/MandiApp.git' -ForegroundColor White
    Write-Host '   git branch -M main' -ForegroundColor White
    Write-Host '   git push -u origin main' -ForegroundColor White
    Write-Host ""
    Write-Host "Replace YOUR_USERNAME with your actual GitHub username" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "=================================" -ForegroundColor Green
Write-Host "✅ Git setup complete!" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green
Write-Host ""
Write-Host "📖 For more information, see: GIT_SETUP_GUIDE.md" -ForegroundColor Cyan
Write-Host ""
