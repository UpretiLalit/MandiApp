# Fix for "src refspec main does not match any" error
# This script fixes the branch name issue and pushes successfully

Write-Host "🔧 Fixing Git Push Issue..." -ForegroundColor Cyan
Write-Host "===========================" -ForegroundColor Cyan
Write-Host ""

cd d:\MandiApp

# Check current branch
Write-Host "Checking current branch..." -ForegroundColor Yellow
$currentBranch = git branch --show-current 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ No branch found. Creating initial commit..." -ForegroundColor Red
    Write-Host ""
    
    # Stage all files
    git add .
    
    # Create initial commit
    git commit -m "Initial commit: MandiApp - Production Ready"
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Commit failed. Checking status..." -ForegroundColor Red
        git status
        exit 1
    }
    
    Write-Host "✓ Commit created" -ForegroundColor Green
    $currentBranch = git branch --show-current
}

Write-Host "Current branch: $currentBranch" -ForegroundColor Cyan
Write-Host ""

# Rename to main if needed
if ($currentBranch -ne "main") {
    Write-Host "Renaming branch to 'main'..." -ForegroundColor Yellow
    git branch -M main
    Write-Host "✓ Branch renamed to 'main'" -ForegroundColor Green
    Write-Host ""
}

# Check remote
Write-Host "Checking remote configuration..." -ForegroundColor Yellow
$remotes = git remote -v

if ($remotes) {
    Write-Host "Remote repositories:" -ForegroundColor Green
    Write-Host $remotes
    Write-Host ""
} else {
    Write-Host "❌ No remote configured!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Add remote first:" -ForegroundColor Yellow
    Write-Host '  git remote add origin https://github.com/UpretiLalit/MandiApp.git' -ForegroundColor White
    Write-Host ""
    $addRemote = Read-Host "Add remote now? (y/n)"
    
    if ($addRemote -eq 'y' -or $addRemote -eq 'Y') {
        git remote add origin https://github.com/UpretiLalit/MandiApp.git
        Write-Host "✓ Remote added" -ForegroundColor Green
        Write-Host ""
    } else {
        exit 0
    }
}

# Push to remote
Write-Host "Pushing to GitHub..." -ForegroundColor Yellow
Write-Host ""

git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "=================================" -ForegroundColor Green
    Write-Host "✅ Successfully pushed to GitHub!" -ForegroundColor Green
    Write-Host "=================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "View your repository at:" -ForegroundColor Cyan
    Write-Host "https://github.com/UpretiLalit/MandiApp" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "=================================" -ForegroundColor Red
    Write-Host "❌ Push failed!" -ForegroundColor Red
    Write-Host "=================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Common issues and solutions:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "1. Authentication Failed:" -ForegroundColor Cyan
    Write-Host "   - GitHub no longer accepts passwords for git operations" -ForegroundColor White
    Write-Host "   - Use Personal Access Token (PAT) instead" -ForegroundColor White
    Write-Host ""
    Write-Host "2. Create Personal Access Token:" -ForegroundColor Cyan
    Write-Host "   a. Go to: https://github.com/settings/tokens" -ForegroundColor White
    Write-Host "   b. Click 'Generate new token (classic)'" -ForegroundColor White
    Write-Host "   c. Give it a name: 'MandiApp Push'" -ForegroundColor White
    Write-Host "   d. Select scope: 'repo' (full control of private repositories)" -ForegroundColor White
    Write-Host "   e. Click 'Generate token'" -ForegroundColor White
    Write-Host "   f. COPY the token (you won't see it again!)" -ForegroundColor White
    Write-Host ""
    Write-Host "3. Push again using token:" -ForegroundColor Cyan
    Write-Host "   When prompted for password, paste your token" -ForegroundColor White
    Write-Host ""
    Write-Host "Or use HTTPS with token in URL:" -ForegroundColor Cyan
    Write-Host "   git remote set-url origin https://YOUR_TOKEN@github.com/UpretiLalit/MandiApp.git" -ForegroundColor White
    Write-Host "   git push -u origin main" -ForegroundColor White
    Write-Host ""
    Write-Host "Or use SSH (recommended for long term):" -ForegroundColor Cyan
    Write-Host "   1. Generate SSH key: ssh-keygen -t ed25519 -C 'your@email.com'" -ForegroundColor White
    Write-Host "   2. Add to GitHub: https://github.com/settings/keys" -ForegroundColor White
    Write-Host "   3. Change remote: git remote set-url origin git@github.com:UpretiLalit/MandiApp.git" -ForegroundColor White
    Write-Host "   4. Push: git push -u origin main" -ForegroundColor White
    Write-Host ""
}
