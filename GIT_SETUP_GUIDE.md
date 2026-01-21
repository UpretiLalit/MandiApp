# 📦 Git Repository Setup & Push Guide

## Prerequisites

### 1. Install Git
Download and install Git from: https://git-scm.com/download/win

**Installation Steps:**
1. Download Git for Windows
2. Run installer with default settings
3. Restart terminal after installation
4. Verify: `git --version`

---

## Quick Push to GitHub (Recommended)

### Step 1: Initialize Git Repository

```powershell
cd d:\MandiApp

# Initialize git
git init

# Configure git (first time only)
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

### Step 2: Create .gitignore

The `.gitignore` file is already created below. It excludes:
- node_modules
- Build outputs (bin, obj, dist)
- Environment files with secrets
- IDE files

### Step 3: Stage All Files

```powershell
# Add all files (respecting .gitignore)
git add .

# Check what will be committed
git status
```

### Step 4: Create Initial Commit

```powershell
git commit -m "Initial commit: MandiApp with Supabase migration complete

- All 23 database tables migrated to Supabase
- Row-Level Security enabled
- 4 microservices (Identity, Marketplace, Ordering, Logistics)
- Angular/Ionic frontend
- SignalR real-time features
- Complete production readiness checklist"
```

### Step 5: Create GitHub Repository

**Option A: Via GitHub Website**
1. Go to https://github.com/new
2. Repository name: `MandiApp`
3. Description: `B2B Mandi Marketplace - Real-time ordering platform`
4. Choose: Private (recommended for production code)
5. Click "Create repository"
6. **DON'T** initialize with README (we already have code)

**Option B: Via GitHub CLI** (if installed)
```powershell
gh repo create MandiApp --private --source=. --remote=origin
```

### Step 6: Connect and Push

After creating the GitHub repository, you'll see commands like:

```powershell
# Add remote repository (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/MandiApp.git

# Rename branch to main (if needed)
git branch -M main

# Push code
git push -u origin main
```

---

## Alternative: Push to Azure DevOps

### Step 1: Create Azure DevOps Project
1. Go to https://dev.azure.com
2. Create new project: "MandiApp"
3. Choose Git for version control

### Step 2: Push Code
```powershell
# Add remote (get URL from Azure DevOps)
git remote add origin https://YOUR_ORG@dev.azure.com/YOUR_ORG/MandiApp/_git/MandiApp

# Push
git push -u origin main
```

---

## Alternative: Push to GitLab

### Step 1: Create GitLab Project
1. Go to https://gitlab.com/projects/new
2. Create project: "MandiApp"

### Step 2: Push Code
```powershell
# Add remote
git remote add origin https://gitlab.com/YOUR_USERNAME/MandiApp.git

# Push
git push -u origin main
```

---

## ⚠️ IMPORTANT: Protect Sensitive Data

### Before Pushing, Review These Files:

**Files with Sensitive Data (MUST be in .gitignore):**

1. **appsettings.json** - Contains database passwords
2. **environment.prod.ts** - Contains API keys
3. **Database connection strings**

### Option 1: Use Environment Variables (Recommended)

Update appsettings.json to use environment variables:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "${SUPABASE_CONNECTION_STRING}"
  },
  "JwtSettings": {
    "SecretKey": "${JWT_SECRET_KEY}"
  }
}
```

### Option 2: Use Git Secrets

Remove sensitive data from committed files:

```powershell
# Remove appsettings.json from git (keep local copy)
git rm --cached Backend/Services/*/appsettings.json
git rm --cached Frontend/src/environments/environment.prod.ts

# Commit the removal
git commit -m "Remove sensitive configuration files"
```

### Create Template Files

Create `appsettings.template.json`:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=YOUR_HOST;Database=YOUR_DB;Username=YOUR_USER;Password=YOUR_PASSWORD"
  },
  "JwtSettings": {
    "SecretKey": "YOUR_SECRET_KEY_HERE"
  }
}
```

---

## 📝 Recommended Commit Message Format

```
<type>: <short description>

<detailed description>

<footer>
```

**Types:**
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `refactor:` Code refactoring
- `test:` Tests
- `chore:` Maintenance

**Examples:**
```
feat: Add real-time price updates with SignalR

- Implemented PriceHub for broadcasting price changes
- Added SignalR service in Angular frontend
- Price updates reflect instantly across all connected clients

Closes #123
```

---

## 🔄 Daily Git Workflow

### Morning: Pull Latest Changes
```powershell
git pull origin main
```

### During Development: Regular Commits
```powershell
# Check what changed
git status

# Stage specific files
git add Backend/Services/Ordering.API/Controllers/OrdersController.cs
git add Frontend/src/app/pages/orders/orders.page.ts

# Or stage all changes
git add .

# Commit with message
git commit -m "feat: Add order cancellation feature"

# Push to remote
git push origin main
```

### End of Day: Push All Work
```powershell
git add .
git commit -m "chore: End of day commit - <what you worked on>"
git push origin main
```

---

## 🌿 Branching Strategy (Recommended)

### For Team Development:

```powershell
# Create feature branch
git checkout -b feature/add-payment-gateway

# Work on feature...
git add .
git commit -m "feat: Implement Razorpay integration"

# Push feature branch
git push origin feature/add-payment-gateway

# On GitHub/GitLab: Create Pull Request
# After review: Merge to main
```

### Branch Naming:
- `feature/description` - New features
- `fix/description` - Bug fixes
- `hotfix/description` - Urgent fixes
- `release/v1.0.0` - Release branches

---

## 🚀 Automated Deployment with Git

### Option 1: GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy Backend

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup .NET
        uses: actions/setup-dotnet@v1
        with:
          dotnet-version: 8.0.x
      - name: Build
        run: dotnet build
      - name: Deploy to Azure
        # Add deployment steps
```

### Option 2: Azure DevOps Pipelines

Create `azure-pipelines.yml`:

```yaml
trigger:
  - main

pool:
  vmImage: 'windows-latest'

steps:
  - task: DotNetCoreCLI@2
    inputs:
      command: 'build'
      projects: '**/*.csproj'
```

---

## 📦 What Will Be Committed

### Backend (C# .NET)
- ✅ Source code (.cs files)
- ✅ Project files (.csproj)
- ✅ Solution files (.sln)
- ❌ bin/ and obj/ folders (excluded)
- ❌ appsettings.json (should be excluded)

### Frontend (Angular/Ionic)
- ✅ TypeScript source files (.ts)
- ✅ HTML templates (.html)
- ✅ SCSS styles (.scss)
- ✅ package.json
- ❌ node_modules/ (excluded)
- ❌ dist/ and www/ (excluded)

### Database
- ✅ Migration scripts (.sql)
- ✅ Schema definitions
- ❌ Actual data (should not commit)

### Documentation
- ✅ README.md
- ✅ All markdown files (.md)
- ✅ Checklists and guides

---

## 🔒 Security Checklist Before Pushing

- [ ] Database passwords removed/masked
- [ ] API keys removed from code
- [ ] JWT secrets not in repository
- [ ] .gitignore properly configured
- [ ] No test data with real user information
- [ ] No local file paths in code
- [ ] Environment-specific configs templated

---

## 📊 Repository Structure After Push

```
MandiApp/
├── .git/                          # Git metadata
├── .gitignore                     # Ignored files list
├── README.md                      # Project overview
├── PRODUCTION_READINESS_CHECKLIST.md
├── DATABASE_MIGRATION_SUMMARY.md
├── Backend/
│   ├── Services/
│   │   ├── Identity.API/
│   │   ├── Marketplace.API/
│   │   ├── Ordering.API/
│   │   └── Logistics.Hub/
│   └── MandiApp.sln
├── Frontend/
│   ├── src/
│   ├── package.json
│   └── angular.json
├── DbMigrationRunner/
├── docker-compose.yml
└── Scripts/
    ├── start-all-services.ps1
    └── create-test-users.ps1
```

---

## 🆘 Troubleshooting

### Large Files Error
```
error: File is too large (> 100 MB)
```

**Solution:** Add to `.gitignore` or use Git LFS:
```powershell
git lfs install
git lfs track "*.apk"
git lfs track "*.ipa"
```

### Authentication Failed
```
remote: Invalid username or password
```

**Solution:** Use Personal Access Token (PAT):
1. GitHub → Settings → Developer settings → Personal access tokens
2. Generate new token with `repo` scope
3. Use token as password when pushing

### Accidentally Committed Secrets
```powershell
# Remove file from all history
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch Backend/Services/Identity.API/appsettings.json" \
  --prune-empty --tag-name-filter cat -- --all

# Force push (WARNING: Rewrites history)
git push origin main --force
```

---

## ✅ Quick Verification

After pushing, verify:

1. **Check GitHub/GitLab**: All files visible
2. **Clone Test**: Try cloning in new folder
   ```powershell
   git clone https://github.com/YOUR_USERNAME/MandiApp.git test-clone
   cd test-clone
   # Verify it works
   ```
3. **Build Test**: Ensure project builds from fresh clone
4. **CI/CD**: If configured, check pipeline runs

---

## 📞 Need Help?

**Common Commands Reference:**

```powershell
# Status
git status                    # Check current changes
git log --oneline            # View commit history
git diff                     # See what changed

# Branches
git branch                   # List branches
git checkout -b new-branch   # Create and switch branch
git merge feature-branch     # Merge branch to current

# Undo Changes
git checkout -- file.txt     # Discard changes to file
git reset HEAD~1             # Undo last commit (keep changes)
git reset --hard HEAD~1      # Undo last commit (discard changes)

# Remote
git remote -v                # Show remote URLs
git fetch origin             # Download changes (don't merge)
git pull origin main         # Download and merge changes
```

---

**Next Step:** Install Git, then run the commands in "Quick Push to GitHub" section above! 🚀
