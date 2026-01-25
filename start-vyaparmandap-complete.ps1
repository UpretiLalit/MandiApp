# Complete startup script for vyaparmandap.com
# This kills old processes and starts everything fresh

$ErrorActionPreference = 'Continue'

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "  MandiApp - Complete Startup for vyaparmandap.com" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Kill all existing processes
Write-Host "[Step 1/4] Cleaning up old processes..." -ForegroundColor Yellow
Get-Process -Name "cloudflared" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Get-Process -Name "dotnet" -ErrorAction SilentlyContinue | Where-Object { $_.Path -like "*MandiApp*" } | Stop-Process -Force -ErrorAction SilentlyContinue
Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.Path -like "*MandiApp*" } | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 3
Write-Host "[SUCCESS] Cleanup complete" -ForegroundColor Green

# Step 2: Start backend services
Write-Host ""
Write-Host "[Step 2/4] Starting Backend Services..." -ForegroundColor Yellow

$rootPath = "D:\MandiApp"

# Identity API - Port 5003
Write-Host "  Starting Identity.API on port 5003..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "`$env:ASPNETCORE_ENVIRONMENT='Development'; cd '$rootPath\Backend\Services\Identity.API'; Write-Host 'Identity.API - Port 5003' -ForegroundColor Green; Write-Host 'Local: http://localhost:5003/swagger' -ForegroundColor Yellow; Write-Host 'Public: https://identity-api.vyaparmandap.com/swagger' -ForegroundColor Cyan; Write-Host ''; dotnet run --urls=http://0.0.0.0:5003"
)
Start-Sleep -Seconds 3

# Marketplace API - Port 5001
Write-Host "  Starting Marketplace.API on port 5001..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "`$env:ASPNETCORE_ENVIRONMENT='Development'; cd '$rootPath\Backend\Services\Marketplace.API'; Write-Host 'Marketplace.API - Port 5001' -ForegroundColor Green; Write-Host 'Local: http://localhost:5001/swagger' -ForegroundColor Yellow; Write-Host 'Public: https://marketplace-api.vyaparmandap.com/swagger' -ForegroundColor Cyan; Write-Host ''; dotnet run --urls=http://0.0.0.0:5001"
)
Start-Sleep -Seconds 3

# Ordering API - Port 5002
Write-Host "  Starting Ordering.API on port 5002..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "`$env:ASPNETCORE_ENVIRONMENT='Development'; cd '$rootPath\Backend\Services\Ordering.API'; Write-Host 'Ordering.API - Port 5002' -ForegroundColor Green; Write-Host 'Local: http://localhost:5002/swagger' -ForegroundColor Yellow; Write-Host 'Public: https://ordering-api.vyaparmandap.com/swagger' -ForegroundColor Cyan; Write-Host ''; dotnet run --urls=http://0.0.0.0:5002"
)
Start-Sleep -Seconds 3

# Logistics Hub - Port 5004
Write-Host "  Starting Logistics.Hub on port 5004..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "`$env:ASPNETCORE_ENVIRONMENT='Development'; cd '$rootPath\Backend\Services\Logistics.Hub'; Write-Host 'Logistics.Hub - Port 5004' -ForegroundColor Green; Write-Host 'Local: http://localhost:5004/swagger' -ForegroundColor Yellow; Write-Host 'Public: https://logistics-hub.vyaparmandap.com/swagger' -ForegroundColor Cyan; Write-Host ''; dotnet run --urls=http://0.0.0.0:5004"
)

Write-Host "[SUCCESS] All backend services starting..." -ForegroundColor Green
Write-Host "[INFO] Waiting 20 seconds for services to initialize..." -ForegroundColor Cyan
Start-Sleep -Seconds 20

# Step 3: Start frontend
Write-Host ""
Write-Host "[Step 3/4] Starting Frontend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "cd '$rootPath\Frontend'; Write-Host 'Frontend - Port 4200' -ForegroundColor Green; Write-Host 'Local: http://localhost:4200' -ForegroundColor Yellow; Write-Host 'Public: https://vyaparmandap.com' -ForegroundColor Cyan; Write-Host ''; npm start"
)
Write-Host "[SUCCESS] Frontend starting..." -ForegroundColor Green
Write-Host "[INFO] Waiting 15 seconds for frontend..." -ForegroundColor Cyan
Start-Sleep -Seconds 15

# Step 4: Start Cloudflare Tunnel
Write-Host ""
Write-Host "[Step 4/4] Starting Cloudflare Tunnel..." -ForegroundColor Yellow

$configFile = "$rootPath\cloudflared-config-vyaparmandap.yml"
if (-not (Test-Path $configFile)) {
    Write-Host "[ERROR] Config file not found: $configFile" -ForegroundColor Red
    exit 1
}

Write-Host "[INFO] Using config: $configFile" -ForegroundColor Cyan
Write-Host ""
Write-Host "==================================================" -ForegroundColor Green
Write-Host "  YOUR LIVE URLS (wait 30 seconds):" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green
Write-Host ""
Write-Host "  Frontend:" -ForegroundColor Yellow
Write-Host "    https://vyaparmandap.com" -ForegroundColor White
Write-Host ""
Write-Host "  Backend APIs:" -ForegroundColor Yellow
Write-Host "    https://identity-api.vyaparmandap.com/swagger" -ForegroundColor White
Write-Host "    https://marketplace-api.vyaparmandap.com/swagger" -ForegroundColor White
Write-Host "    https://ordering-api.vyaparmandap.com/swagger" -ForegroundColor White
Write-Host "    https://logistics-hub.vyaparmandap.com/swagger" -ForegroundColor White
Write-Host ""
Write-Host "==================================================" -ForegroundColor Green
Write-Host ""
Write-Host "[INFO] Tunnel will run in THIS window. Press Ctrl+C to stop." -ForegroundColor Cyan
Write-Host "[INFO] Keep this window open while using the app." -ForegroundColor Cyan
Write-Host ""

cloudflared tunnel --config $configFile run vyaparmandap-tunnel
