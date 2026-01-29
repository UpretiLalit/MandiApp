# Complete VM Setup Script - Run this FIRST before deployment
# Sets up Oracle Cloud VM with all required software

param(
    [Parameter(Mandatory=$true)]
    [string]$VMIP = "140.245.9.144",
    
    [string]$VMUser = "ubuntu"
)

$ErrorActionPreference = "Stop"

Write-Host "================================" -ForegroundColor Cyan
Write-Host "Oracle Cloud VM - Initial Setup" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "VM IP: $VMIP" -ForegroundColor Yellow
Write-Host "User: $VMUser" -ForegroundColor Yellow
Write-Host ""

# Step 1: Generate SSH Key if needed
Write-Host "Step 1: SSH Key Setup" -ForegroundColor Green
Write-Host "---------------------" -ForegroundColor Green

if (-not (Test-Path "$env:USERPROFILE\.ssh\id_rsa")) {
    Write-Host "Generating new SSH key pair..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Force -Path "$env:USERPROFILE\.ssh" | Out-Null
    ssh-keygen -t rsa -b 4096 -f "$env:USERPROFILE\.ssh\id_rsa" -N '""'
}

$publicKey = Get-Content "$env:USERPROFILE\.ssh\id_rsa.pub" -Raw

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "YOUR SSH PUBLIC KEY:" -ForegroundColor Yellow
Write-Host "================================" -ForegroundColor Cyan
Write-Host $publicKey -ForegroundColor White
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "ACTION REQUIRED:" -ForegroundColor Red
Write-Host "1. Open Oracle Cloud Console" -ForegroundColor Yellow
Write-Host "2. Go to your VM instance" -ForegroundColor Yellow
Write-Host "3. Click 'Connect' > 'SSH' tab" -ForegroundColor Yellow
Write-Host "4. Add the above public key to authorized_keys" -ForegroundColor Yellow
Write-Host ""
Write-Host "OR connect to VM via browser console and run:" -ForegroundColor Yellow
Write-Host "  mkdir -p ~/.ssh" -ForegroundColor Cyan
Write-Host "  echo '$publicKey' >> ~/.ssh/authorized_keys" -ForegroundColor Cyan
Write-Host "  chmod 700 ~/.ssh" -ForegroundColor Cyan
Write-Host "  chmod 600 ~/.ssh/authorized_keys" -ForegroundColor Cyan
Write-Host ""

$ready = Read-Host "Have you added the SSH key to the VM? (yes/no)"
if ($ready -ne "yes") {
    Write-Host "[ERROR] Please add the SSH key first, then run this script again." -ForegroundColor Red
    exit 1
}

# Step 2: Test SSH Connection
Write-Host ""
Write-Host "Step 2: Testing SSH Connection" -ForegroundColor Green
Write-Host "-----------------------------" -ForegroundColor Green

Write-Host "Connecting to $VMIP..." -ForegroundColor Yellow
try {
    $result = ssh -o ConnectTimeout=10 -o StrictHostKeyChecking=no ${VMUser}@${VMIP} "hostname && whoami"
    Write-Host "[SUCCESS] SSH Connection successful!" -ForegroundColor Green
    Write-Host "Connected to: $result" -ForegroundColor Cyan
} catch {
    Write-Host "[ERROR] SSH connection failed!" -ForegroundColor Red
    Write-Host "Please check:" -ForegroundColor Yellow
    Write-Host "  - VM is running in Oracle Cloud Console" -ForegroundColor Yellow
    Write-Host "  - SSH key is correctly added" -ForegroundColor Yellow
    Write-Host "  - Security rules allow port 22" -ForegroundColor Yellow
    exit 1
}

# Step 3: Configure Oracle Cloud Security Rules
Write-Host ""
Write-Host "Step 3: Security Rules Configuration" -ForegroundColor Green
Write-Host "------------------------------------" -ForegroundColor Green
Write-Host ""
Write-Host "IMPORTANT: Configure these Ingress Rules in Oracle Cloud Console:" -ForegroundColor Red
Write-Host ""
Write-Host "Go to: Networking > Virtual Cloud Networks > Your VCN > Security Lists > Default Security List" -ForegroundColor Yellow
Write-Host ""
Write-Host "Add these Ingress Rules:" -ForegroundColor Cyan
Write-Host "  1. Source: 0.0.0.0/0, Protocol: TCP, Port: 80 (HTTP)" -ForegroundColor White
Write-Host "  2. Source: 0.0.0.0/0, Protocol: TCP, Port: 443 (HTTPS)" -ForegroundColor White
Write-Host "  3. Source: 0.0.0.0/0, Protocol: TCP, Port: 22 (SSH - if not already)" -ForegroundColor White
Write-Host ""

$securityDone = Read-Host "Have you configured the security rules? (yes/no)"
if ($securityDone -ne "yes") {
    Write-Host "[WARNING] Security rules not configured. You may not be able to access the application." -ForegroundColor Yellow
}

# Step 4: Install Required Software on VM
Write-Host ""
Write-Host "Step 4: Installing Software on VM" -ForegroundColor Green
Write-Host "--------------------------------" -ForegroundColor Green

$vmSetupScript = @'
#!/bin/bash
set -e

echo ""
echo "================================"
echo "Installing Required Software"
echo "================================"
echo ""

# Update system
echo "📦 Updating system packages..."
sudo apt update
DEBIAN_FRONTEND=noninteractive sudo apt upgrade -y

# Install Docker
echo ""
echo "🐳 Installing Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh
    echo "✅ Docker installed"
else
    echo "✅ Docker already installed"
fi

# Install Docker Compose
echo ""
echo "📦 Installing Docker Compose..."
sudo apt install -y docker-compose-plugin

# Install Nginx
echo ""
echo "🌐 Installing Nginx..."
sudo apt install -y nginx
sudo systemctl enable nginx
sudo systemctl stop nginx  # Stop for now, will use in Docker

# Install Certbot for SSL
echo ""
echo "🔒 Installing Certbot..."
sudo apt install -y certbot python3-certbot-nginx

# Install useful tools
echo ""
echo "🛠️  Installing additional tools..."
sudo apt install -y curl wget git htop nano

# Configure firewall using iptables (Oracle Linux uses iptables)
echo ""
echo "🔥 Configuring firewall..."
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80 -j ACCEPT
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 443 -j ACCEPT
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 22 -j ACCEPT
sudo netfilter-persistent save || sudo iptables-save | sudo tee /etc/iptables/rules.v4

# Create app directory
echo ""
echo "📁 Creating application directory..."
mkdir -p ~/mandiapp
mkdir -p ~/mandiapp/nginx
mkdir -p ~/mandiapp/nginx/ssl

# Set timezone
echo ""
echo "🕐 Setting timezone to Asia/Kolkata..."
sudo timedatectl set-timezone Asia/Kolkata

# Show Docker info
echo ""
echo "🐳 Docker version:"
docker --version
docker compose version

echo ""
echo "================================"
echo "✅ VM Setup Complete!"
echo "================================"
echo ""
echo "⚠️  IMPORTANT: Log out and log back in for Docker permissions to take effect"
echo ""
echo "Next steps:"
echo "  1. Exit this SSH session: exit"
echo "  2. Reconnect: ssh ubuntu@140.245.9.144"
echo "  3. Run deployment script from your local machine"
'@

Write-Host "Installing software on VM (this may take 5-10 minutes)..." -ForegroundColor Yellow
Write-Host ""

$vmSetupScript | ssh ${VMUser}@${VMIP} "bash -s"

# Step 5: Summary
Write-Host ""
Write-Host "================================" -ForegroundColor Green
Write-Host "[SUCCESS] VM SETUP COMPLETE!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host ""
Write-Host "What was installed:" -ForegroundColor Cyan
Write-Host "  [OK] Docker & Docker Compose" -ForegroundColor White
Write-Host "  [OK] Nginx" -ForegroundColor White
Write-Host "  [OK] Certbot (for SSL certificates)" -ForegroundColor White
Write-Host "  [OK] Firewall configured" -ForegroundColor White
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "  1. Close and reconnect to VM for Docker permissions:" -ForegroundColor Yellow
Write-Host "     ssh ${VMUser}@${VMIP}" -ForegroundColor White
Write-Host ""
Write-Host "  2. Deploy your application:" -ForegroundColor Yellow
Write-Host "     .\deploy-to-oracle.ps1" -ForegroundColor White
Write-Host ""
Write-Host "  3. After deployment, configure domain:" -ForegroundColor Yellow
Write-Host "     - Point vyaparmandap.com to $VMIP in DNS" -ForegroundColor White
Write-Host "     - Setup SSL: ssh ${VMUser}@${VMIP} 'sudo certbot --nginx -d vyaparmandap.com'" -ForegroundColor White
Write-Host ""
Write-Host "Useful VM Commands:" -ForegroundColor Cyan
Write-Host "  SSH connect:      ssh ${VMUser}@${VMIP}" -ForegroundColor White
Write-Host "  View logs:        docker compose logs -f" -ForegroundColor White
Write-Host "  Check containers: docker compose ps" -ForegroundColor White
Write-Host "  Restart app:      docker compose restart" -ForegroundColor White
Write-Host ""
