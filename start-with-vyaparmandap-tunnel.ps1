# Start All Services + Cloudflare Tunnel for vyaparmandap.com
# This script starts backend services, frontend, and the Cloudflare tunnel

$ErrorActionPreference = 'Continue'

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "  Starting MandiApp with vyaparmandap.com Tunnel " -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

# Start backend services in background
Write-Host ""
Write-Host "[1/3] Starting Backend Services..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; .\start-all-services.ps1"
Write-Host "[SUCCESS] Backend services starting in new window" -ForegroundColor Green

# Wait a bit for services to initialize
Write-Host "[INFO] Waiting 10 seconds for services to initialize..." -ForegroundColor Cyan
Start-Sleep -Seconds 10

# Start frontend in background
Write-Host ""
Write-Host "[2/3] Starting Frontend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\Frontend'; npm start"
Write-Host "[SUCCESS] Frontend starting in new window" -ForegroundColor Green

# Wait for frontend to start
Write-Host "[INFO] Waiting 15 seconds for frontend to start..." -ForegroundColor Cyan
Start-Sleep -Seconds 15

# Check if config file exists
$configFile = ".\cloudflared-config-vyaparmandap.yml"
if (-not (Test-Path $configFile)) {
    Write-Host "[ERROR] Config file not found: $configFile" -ForegroundColor Red
    Write-Host "[INFO] Please run setup-vyaparmandap-tunnel.ps1 first" -ForegroundColor Yellow
    exit 1
}

# Start Cloudflare tunnel
Write-Host ""
Write-Host "[3/3] Starting Cloudflare Tunnel..." -ForegroundColor Yellow
Write-Host "[INFO] Tunnel will run in this window. Press Ctrl+C to stop." -ForegroundColor Cyan
Write-Host ""
Write-Host "==================================================" -ForegroundColor Green
Write-Host "  YOUR LIVE URLS:" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green
Write-Host "  Frontend:        https://vyaparmandap.com" -ForegroundColor White
Write-Host "  Identity API:    https://identity-api.vyaparmandap.com" -ForegroundColor White
Write-Host "  Marketplace API: https://marketplace-api.vyaparmandap.com" -ForegroundColor White
Write-Host "  Ordering API:    https://ordering-api.vyaparmandap.com" -ForegroundColor White
Write-Host "  Logistics Hub:   https://logistics-hub.vyaparmandap.com" -ForegroundColor White
Write-Host "==================================================" -ForegroundColor Green
Write-Host ""

cloudflared tunnel --config $configFile run vyaparmandap-tunnel
