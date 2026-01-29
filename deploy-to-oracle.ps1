# MandiApp - Oracle Cloud VM Deployment Script
# This script deploys your application to Oracle Cloud VM

param(
    [string]$VMUser = "ubuntu",
    [string]$VMIP = "140.245.9.144",
    [switch]$SkipBuild,
    [switch]$SetupOnly
)

$ErrorActionPreference = "Stop"

Write-Host "================================" -ForegroundColor Cyan
Write-Host "MandiApp Oracle Cloud Deployment" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Check if SSH key exists
if (-not (Test-Path "$env:USERPROFILE\.ssh\id_rsa")) {
    Write-Host "⚠️  No SSH key found. Generating SSH key pair..." -ForegroundColor Yellow
    ssh-keygen -t rsa -b 4096 -f "$env:USERPROFILE\.ssh\id_rsa" -N '""'
    Write-Host ""
    Write-Host "📋 Copy this public key to Oracle Cloud VM:" -ForegroundColor Green
    Get-Content "$env:USERPROFILE\.ssh\id_rsa.pub"
    Write-Host ""
    Write-Host "Run this on VM: echo 'YOUR_PUBLIC_KEY' >> ~/.ssh/authorized_keys" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Press Enter after adding the key to VM..."
}

# Test SSH connection
Write-Host "🔍 Testing SSH connection to ${VMIP}..." -ForegroundColor Yellow
try {
    ssh -o ConnectTimeout=10 -o StrictHostKeyChecking=no ${VMUser}@${VMIP} "echo 'Connection successful'"
    Write-Host "✅ SSH connection successful" -ForegroundColor Green
} catch {
    Write-Host "❌ Cannot connect to VM. Please check:" -ForegroundColor Red
    Write-Host "   1. VM is running" -ForegroundColor Yellow
    Write-Host "   2. Security rules allow port 22" -ForegroundColor Yellow
    Write-Host "   3. SSH key is added to VM" -ForegroundColor Yellow
    exit 1
}

# Build Frontend
if (-not $SkipBuild) {
    Write-Host ""
    Write-Host "📦 Building Angular Frontend..." -ForegroundColor Yellow
    Push-Location Frontend
    try {
        # Update environment with production API URL
        $envContent = @"
export const environment = {
  production: true,
  apiUrl: 'http://${VMIP}',
  identityApiUrl: 'http://${VMIP}/api/identity',
  marketplaceApiUrl: 'http://${VMIP}/api/marketplace',
  orderingApiUrl: 'http://${VMIP}/api/ordering',
  logisticsHubUrl: 'http://${VMIP}/api/logistics'
};
"@
        Set-Content -Path "src/environments/environment.prod.ts" -Value $envContent -Force
        
        npm run build --prod
        if ($LASTEXITCODE -ne 0) { throw "Frontend build failed" }
        Write-Host "✅ Frontend built successfully" -ForegroundColor Green
    } finally {
        Pop-Location
    }
}

if ($SetupOnly) {
    Write-Host ""
    Write-Host "🚀 Setting up VM environment..." -ForegroundColor Yellow
    
    # Create setup script
    $setupScript = @'
#!/bin/bash
set -e

echo "================================"
echo "VM Environment Setup"
echo "================================"
echo ""

# Update system
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Docker
if ! command -v docker &> /dev/null; then
    echo "🐳 Installing Docker..."
    sudo apt install -y docker.io docker-compose
    sudo systemctl enable docker
    sudo systemctl start docker
    sudo usermod -aG docker $USER
    echo "✅ Docker installed"
else
    echo "✅ Docker already installed"
fi

# Install Docker Compose v2
if ! docker compose version &> /dev/null; then
    echo "📦 Installing Docker Compose v2..."
    sudo apt install -y docker-compose-plugin
fi

# Install Nginx
if ! command -v nginx &> /dev/null; then
    echo "🌐 Installing Nginx..."
    sudo apt install -y nginx
    sudo systemctl enable nginx
    echo "✅ Nginx installed"
else
    echo "✅ Nginx already installed"
fi

# Install certbot for SSL (Let's Encrypt)
if ! command -v certbot &> /dev/null; then
    echo "🔒 Installing Certbot for SSL..."
    sudo apt install -y certbot python3-certbot-nginx
    echo "✅ Certbot installed"
else
    echo "✅ Certbot already installed"
fi

# Create application directory
echo "📁 Creating application directory..."
mkdir -p ~/mandiapp
mkdir -p ~/mandiapp/nginx
mkdir -p ~/mandiapp/nginx/ssl

# Enable firewall rules
echo "🔥 Configuring firewall..."
sudo apt install -y ufw
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 5432/tcp
sudo ufw --force enable

echo ""
echo "================================"
echo "✅ VM Setup Complete!"
echo "================================"
echo ""
echo "⚠️  IMPORTANT: You need to log out and log back in for Docker group changes to take effect"
echo "    Run: exit"
echo "    Then reconnect: ssh ubuntu@140.245.9.144"
'@

    $setupScript | ssh ${VMUser}@${VMIP} "cat > /tmp/setup.sh && chmod +x /tmp/setup.sh && /tmp/setup.sh"
    
    Write-Host ""
    Write-Host "✅ VM setup complete!" -ForegroundColor Green
    Write-Host "⚠️  Please reconnect to VM (logout/login) for Docker group changes" -ForegroundColor Yellow
    exit 0
}

# Create deployment package
Write-Host ""
Write-Host "📦 Creating deployment package..." -ForegroundColor Yellow
$tempDir = "$env:TEMP\mandiapp-deploy-$(Get-Date -Format 'yyyyMMddHHmmss')"
New-Item -ItemType Directory -Force -Path $tempDir | Out-Null

# Copy necessary files
Copy-Item "docker-compose.prod.yml" "$tempDir\docker-compose.yml"
Copy-Item ".env.production" "$tempDir\.env"
Copy-Item "init-databases.sql" "$tempDir\"
Copy-Item "nginx\nginx.conf" "$tempDir\nginx.conf"
Copy-Item -Recurse "Backend" "$tempDir\"
Copy-Item -Recurse "Frontend\www" "$tempDir\www"

Write-Host "✅ Deployment package created" -ForegroundColor Green

# Upload to VM
Write-Host ""
Write-Host "⬆️  Uploading to VM..." -ForegroundColor Yellow
ssh ${VMUser}@${VMIP} "mkdir -p ~/mandiapp"
scp -r "$tempDir\*" ${VMUser}@${VMIP}:~/mandiapp/

Write-Host "✅ Files uploaded" -ForegroundColor Green

# Deploy on VM
Write-Host ""
Write-Host "🚀 Deploying application on VM..." -ForegroundColor Yellow

$deployScript = @'
#!/bin/bash
set -e

cd ~/mandiapp

echo "🔧 Configuring environment..."
# Generate secure JWT secret if not set
if grep -q "CHANGE_THIS" .env; then
    JWT_SECRET=$(openssl rand -base64 64 | tr -d '\n')
    sed -i "s|JWT_SECRET=CHANGE_THIS_TO_SECURE_RANDOM_STRING_MIN_64_CHARS|JWT_SECRET=$JWT_SECRET|g" .env
    
    DB_PASSWORD=$(openssl rand -base64 32 | tr -d '\n')
    sed -i "s|POSTGRES_PASSWORD=CHANGE_THIS_SECURE_PASSWORD|POSTGRES_PASSWORD=$DB_PASSWORD|g" .env
fi

echo "🐳 Starting Docker containers..."
docker compose down --remove-orphans
docker compose up --build -d

echo ""
echo "⏳ Waiting for services to be ready..."
sleep 30

echo ""
echo "🔍 Checking service health..."
docker compose ps

echo ""
echo "================================"
echo "✅ Deployment Complete!"
echo "================================"
echo ""
echo "🌐 Your application is now available at:"
echo "   http://140.245.9.144"
echo ""
echo "📊 Check logs:"
echo "   docker compose logs -f"
echo ""
echo "🔄 Restart services:"
echo "   docker compose restart"
echo ""
echo "🛑 Stop services:"
echo "   docker compose down"
'@

$deployScript | ssh ${VMUser}@${VMIP} "cat > ~/mandiapp/deploy.sh && chmod +x ~/mandiapp/deploy.sh && ./mandiapp/deploy.sh"

# Cleanup
Remove-Item -Recurse -Force $tempDir

Write-Host ""
Write-Host "================================" -ForegroundColor Green
Write-Host "✅ DEPLOYMENT SUCCESSFUL!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Your application is now running at:" -ForegroundColor Cyan
Write-Host "   http://${VMIP}" -ForegroundColor Yellow
Write-Host ""
Write-Host "📊 Useful commands:" -ForegroundColor Cyan
Write-Host "   View logs:     ssh ${VMUser}@${VMIP} 'cd ~/mandiapp && docker compose logs -f'" -ForegroundColor Yellow
Write-Host "   Check status:  ssh ${VMUser}@${VMIP} 'cd ~/mandiapp && docker compose ps'" -ForegroundColor Yellow
Write-Host "   Restart:       ssh ${VMUser}@${VMIP} 'cd ~/mandiapp && docker compose restart'" -ForegroundColor Yellow
Write-Host ""
Write-Host "🔒 Next Steps:" -ForegroundColor Cyan
Write-Host "   1. Configure domain name (vyaparmandap.com) to point to ${VMIP}" -ForegroundColor Yellow
Write-Host "   2. Setup SSL certificate: ssh ${VMUser}@${VMIP} 'sudo certbot --nginx -d vyaparmandap.com'" -ForegroundColor Yellow
Write-Host "   3. Update nginx.conf to enable HTTPS redirects" -ForegroundColor Yellow
Write-Host ""
