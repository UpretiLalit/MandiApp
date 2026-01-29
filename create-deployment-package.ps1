# Simple deployment script that uses Oracle Cloud API or manual upload
# Since SSH key access is not setup yet, we'll create a package you can upload manually

$ErrorActionPreference = "Stop"

Write-Host "================================" -ForegroundColor Cyan
Write-Host "Manual Deployment Package Creator" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Create deployment package
Write-Host "Creating deployment package..." -ForegroundColor Yellow
$packageDir = "d:\MandiApp\deployment-package"

if (Test-Path $packageDir) {
    Remove-Item -Recurse -Force $packageDir
}

New-Item -ItemType Directory -Force -Path $packageDir | Out-Null
New-Item -ItemType Directory -Force -Path "$packageDir\nginx" | Out-Null

# Copy files
Copy-Item "docker-compose.prod.yml" "$packageDir\docker-compose.yml"
Copy-Item ".env.production" "$packageDir\.env"
Copy-Item "init-databases.sql" "$packageDir\"
Copy-Item "nginx\nginx.conf" "$packageDir\nginx\nginx.conf"

Write-Host "[OK] Base files copied" -ForegroundColor Green

# Build Frontend
Write-Host ""
Write-Host "Building Frontend..." -ForegroundColor Yellow
Push-Location Frontend

$envContent = @"
export const environment = {
  production: true,
  apiUrl: 'http://140.245.9.144/api',
  identityApiUrl: 'http://140.245.9.144/api/identity',
  marketplaceApiUrl: 'http://140.245.9.144/api/marketplace',
  orderingApiUrl: 'http://140.245.9.144/api/ordering',
  logisticsHubUrl: 'http://140.245.9.144/api/logistics',
  trackingHubUrl: 'http://140.245.9.144/api/logistics/hubs/tracking',
  priceHubUrl: 'http://140.245.9.144/api/marketplace/hubs/price',
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

if (-not (Test-Path "src/environments")) {
    New-Item -ItemType Directory -Force -Path "src/environments" | Out-Null
}
Set-Content -Path "src/environments/environment.prod.ts" -Value $envContent

# Increase Angular budget for large stylesheets
$angularJson = Get-Content "angular.json" -Raw | ConvertFrom-Json
if ($angularJson.projects.app.architect.build.configurations.production.budgets) {
    foreach ($budget in $angularJson.projects.app.architect.build.configurations.production.budgets) {
        if ($budget.type -eq "initial") {
            $budget.maximumWarning = "2mb"
            $budget.maximumError = "5mb"
        }
        if ($budget.type -eq "anyComponentStyle") {
            $budget.maximumWarning = "50kb"
            $budget.maximumError = "100kb"
        }
    }
    $angularJson | ConvertTo-Json -Depth 20 | Set-Content "angular.json"
}

npm run build --prod
if ($LASTEXITCODE -eq 0) {
    Copy-Item -Recurse "www" "$packageDir\"
    Write-Host "[OK] Frontend built" -ForegroundColor Green
} else {
    Write-Host "[WARNING] Frontend build failed, copying source files instead" -ForegroundColor Yellow
    # Copy source for building on VM
    Copy-Item -Recurse "src" "$packageDir\frontend-src\"
    Copy-Item "package.json" "$packageDir\frontend-src\"
    Copy-Item "angular.json" "$packageDir\frontend-src\"
    Copy-Item "tsconfig.json" "$packageDir\frontend-src\"
    Copy-Item "tsconfig.app.json" "$packageDir\frontend-src\" -ErrorAction SilentlyContinue
}

Pop-Location

# Copy Backend
Write-Host ""
Write-Host "Copying Backend..." -ForegroundColor Yellow
Copy-Item -Recurse "Backend" "$packageDir\"
Write-Host "[OK] Backend copied" -ForegroundColor Green

# Create setup script for VM
$setupScript = @'
#!/bin/bash
set -e

echo "================================"
echo "MandiApp Setup"
echo "================================"
echo ""

# Install Docker if not installed
if ! command -v docker &> /dev/null; then
    echo "Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh
fi

# Install Docker Compose
if ! docker compose version &> /dev/null; then
    echo "Installing Docker Compose..."
    sudo apt-get update
    sudo apt-get install -y docker-compose-plugin
fi

# Configure environment
echo "Setting up environment..."
if grep -q "CHANGE_THIS" .env; then
    JWT_SECRET=$(openssl rand -base64 64 | tr -d '\n')
    sed -i "s|JWT_SECRET=CHANGE_THIS_TO_SECURE_RANDOM_STRING_MIN_64_CHARS|JWT_SECRET=$JWT_SECRET|g" .env
    
    DB_PASSWORD=$(openssl rand -base64 32 | tr -d '\n')
    sed -i "s|POSTGRES_PASSWORD=CHANGE_THIS_SECURE_PASSWORD|POSTGRES_PASSWORD=$DB_PASSWORD|g" .env
fi

# Start services
echo ""
echo "Starting services..."
docker compose down --remove-orphans 2>/dev/null || true
docker compose up --build -d

echo ""
echo "================================"
echo "Deployment Complete!"
echo "================================"
echo ""
echo "Application URL: http://140.245.9.144"
echo ""
echo "Check status: docker compose ps"
echo "View logs: docker compose logs -f"
'@

Set-Content -Path "$packageDir\setup.sh" -Value $setupScript
Set-Content -Path "$packageDir\setup.sh" -Value $setupScript -NoNewline

# Create instructions
$instructions = @"
================================
MANUAL DEPLOYMENT INSTRUCTIONS
================================

Since SSH access is not yet configured, follow these steps:

STEP 1: Add Your SSH Key to Oracle Cloud
-----------------------------------------
1. Go to Oracle Cloud Console > Compute > Instances
2. Click on 'vyaparmandap-server'
3. Click 'Edit' button
4. Find 'Add SSH keys' section
5. Click 'Paste SSH keys'
6. Paste your public key (shown below)
7. Click 'Save'

YOUR SSH PUBLIC KEY:
---------------------------------------------------
$(Get-Content "$env:USERPROFILE\.ssh\id_rsa.pub" -Raw)
---------------------------------------------------

STEP 2: Upload Deployment Package
----------------------------------
After adding SSH key, you can upload using SCP:

  scp -r "$packageDir\*" ubuntu@140.245.9.144:~/mandiapp/

Or if username is 'opc':

  scp -r "$packageDir\*" opc@140.245.9.144:~/mandiapp/

STEP 3: Run Setup on VM
------------------------
SSH into your VM:

  ssh ubuntu@140.245.9.144

Then run:

  cd ~/mandiapp
  chmod +x setup.sh
  ./setup.sh

ALTERNATIVE: Use Oracle Cloud Shell Upload
-------------------------------------------
1. In Oracle Cloud Console, open Cloud Shell (top right icon)
2. Click the 'Upload' button in Cloud Shell menu
3. Upload the entire folder: $packageDir
4. From Cloud Shell, SCP to your VM using private IP:
   
   scp -r deployment-package/* ubuntu@10.0.0.13:~/mandiapp/
   ssh ubuntu@10.0.0.13
   cd ~/mandiapp
   chmod +x setup.sh
   ./setup.sh

================================

Deployment package created at:
$packageDir

"@

Set-Content -Path "$packageDir\INSTRUCTIONS.txt" -Value $instructions

Write-Host ""
Write-Host "================================" -ForegroundColor Green
Write-Host "[SUCCESS] Package Created!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host ""
Write-Host "Location: $packageDir" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Read: $packageDir\INSTRUCTIONS.txt" -ForegroundColor White
Write-Host "2. Add SSH key via Oracle Cloud Console" -ForegroundColor White
Write-Host "3. Upload package to VM" -ForegroundColor White
Write-Host "4. Run setup.sh on VM" -ForegroundColor White
Write-Host ""

# Open instructions
notepad "$packageDir\INSTRUCTIONS.txt"
