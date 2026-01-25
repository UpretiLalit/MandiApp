# Cloudflare Tunnel Setup for vyaparmandap.com
# Quick setup script for your new domain

$ErrorActionPreference = 'Stop'

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "  Cloudflare Tunnel Setup for vyaparmandap.com   " -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check if cloudflared is installed
Write-Host "[Step 1/5] Checking cloudflared installation..." -ForegroundColor Yellow
try {
    $version = cloudflared --version 2>&1 | Out-String
    Write-Host "[SUCCESS] cloudflared is installed: $version" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] cloudflared not found. Installing..." -ForegroundColor Red
    .\cloudflare-setup.ps1 -Action install
    Write-Host "[INFO] Please restart your terminal and run this script again" -ForegroundColor Yellow
    exit 0
}

# Step 2: Check authentication
Write-Host ""
Write-Host "[Step 2/5] Checking Cloudflare authentication..." -ForegroundColor Yellow
$certPath = "$env:USERPROFILE\.cloudflared\cert.pem"
if (Test-Path $certPath) {
    Write-Host "[SUCCESS] Already authenticated with Cloudflare" -ForegroundColor Green
} else {
    Write-Host "[INFO] Need to authenticate. Browser will open..." -ForegroundColor Cyan
    cloudflared tunnel login
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[SUCCESS] Authentication successful!" -ForegroundColor Green
    } else {
        Write-Host "[ERROR] Authentication failed" -ForegroundColor Red
        exit 1
    }
}

# Step 3: Create tunnel
Write-Host ""
Write-Host "[Step 3/5] Creating tunnel 'vyaparmandap-tunnel'..." -ForegroundColor Yellow

# Check if tunnel already exists
$existingTunnels = cloudflared tunnel list 2>&1 | Out-String
if ($existingTunnels -match "vyaparmandap-tunnel") {
    Write-Host "[INFO] Tunnel 'vyaparmandap-tunnel' already exists" -ForegroundColor Cyan
    
    # Get tunnel ID
    $tunnelInfo = cloudflared tunnel list | Select-String "vyaparmandap-tunnel"
    if ($tunnelInfo) {
        Write-Host "[INFO] Existing tunnel: $tunnelInfo" -ForegroundColor Cyan
    }
} else {
    Write-Host "[INFO] Creating new tunnel..." -ForegroundColor Cyan
    cloudflared tunnel create vyaparmandap-tunnel
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[SUCCESS] Tunnel created successfully!" -ForegroundColor Green
    } else {
        Write-Host "[ERROR] Failed to create tunnel" -ForegroundColor Red
        exit 1
    }
}

# Get the tunnel ID
Write-Host ""
Write-Host "[INFO] Getting tunnel details..." -ForegroundColor Cyan
$tunnelList = cloudflared tunnel list | Select-String "vyaparmandap-tunnel"
Write-Host $tunnelList -ForegroundColor White

# Extract tunnel ID
$tunnelId = ($tunnelList -split '\s+')[0]
if ($tunnelId) {
    Write-Host ""
    Write-Host "[IMPORTANT] Your Tunnel ID: $tunnelId" -ForegroundColor Yellow
    Write-Host "[INFO] Credentials file: $env:USERPROFILE\.cloudflared\$tunnelId.json" -ForegroundColor Cyan
    
    # Update config file
    $configPath = ".\cloudflared-config-vyaparmandap.yml"
    if (Test-Path $configPath) {
        $config = Get-Content $configPath -Raw
        $config = $config -replace "credentials-file: .*", "credentials-file: $env:USERPROFILE\.cloudflared\$tunnelId.json"
        $config | Set-Content $configPath
        Write-Host "[SUCCESS] Updated $configPath with tunnel ID" -ForegroundColor Green
    }
}

# Step 4: Configure DNS
Write-Host ""
Write-Host "[Step 4/5] Configuring DNS records..." -ForegroundColor Yellow
Write-Host "[INFO] Setting up DNS for vyaparmandap.com" -ForegroundColor Cyan

$subdomains = @(
    "www",
    "identity-api",
    "marketplace-api", 
    "ordering-api",
    "logistics-hub"
)

Write-Host "[INFO] Creating CNAME records..." -ForegroundColor Cyan
foreach ($subdomain in $subdomains) {
    Write-Host "  - $subdomain.vyaparmandap.com" -ForegroundColor Gray
    cloudflared tunnel route dns vyaparmandap-tunnel "$subdomain.vyaparmandap.com" 2>&1 | Out-Null
}

# Root domain
Write-Host "  - vyaparmandap.com (root)" -ForegroundColor Gray
cloudflared tunnel route dns vyaparmandap-tunnel "vyaparmandap.com" 2>&1 | Out-Null

Write-Host "[SUCCESS] DNS records configured!" -ForegroundColor Green
Write-Host "[INFO] DNS may take 1-5 minutes to propagate" -ForegroundColor Cyan

# Step 5: Instructions to start
Write-Host ""
Write-Host "[Step 5/5] Setup Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "  NEXT STEPS" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Start all your backend services:" -ForegroundColor Yellow
Write-Host "   .\start-all-services.ps1" -ForegroundColor White
Write-Host ""
Write-Host "2. Start the Cloudflare tunnel:" -ForegroundColor Yellow
Write-Host "   cloudflared tunnel --config cloudflared-config-vyaparmandap.yml run vyaparmandap-tunnel" -ForegroundColor White
Write-Host ""
Write-Host "   OR use the combined script:" -ForegroundColor Yellow
Write-Host "   .\start-with-vyaparmandap-tunnel.ps1" -ForegroundColor White
Write-Host ""
Write-Host "3. Your URLs will be:" -ForegroundColor Yellow
Write-Host "   Frontend:        https://vyaparmandap.com" -ForegroundColor White
Write-Host "   Identity API:    https://identity-api.vyaparmandap.com" -ForegroundColor White
Write-Host "   Marketplace API: https://marketplace-api.vyaparmandap.com" -ForegroundColor White
Write-Host "   Ordering API:    https://ordering-api.vyaparmandap.com" -ForegroundColor White
Write-Host "   Logistics Hub:   https://logistics-hub.vyaparmandap.com" -ForegroundColor White
Write-Host ""
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "[TIP] Test your tunnel status with:" -ForegroundColor Cyan
Write-Host "      cloudflared tunnel info vyaparmandap-tunnel" -ForegroundColor White
Write-Host ""
