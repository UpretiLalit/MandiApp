# Start all services with Cloudflare Tunnel
Write-Host "🚀 Starting MandiApp with Cloudflare Tunnel..." -ForegroundColor Green

# Kill any existing dotnet processes
Write-Host "Stopping existing services..." -ForegroundColor Yellow
Get-Process | Where-Object {$_.ProcessName -eq "dotnet"} | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# Start Identity API in background
Write-Host "Starting Identity API on port 5003..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd D:\MandiApp\Backend\Services\Identity.API; dotnet run" -WindowStyle Normal

Start-Sleep -Seconds 5

# Start Marketplace API in background
Write-Host "Starting Marketplace API on port 5001..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd D:\MandiApp\Backend\Services\Marketplace.API; dotnet run" -WindowStyle Normal

Start-Sleep -Seconds 5

# Start Ordering API in background
Write-Host "Starting Ordering API on port 5002..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd D:\MandiApp\Backend\Services\Ordering.API; dotnet run" -WindowStyle Normal

Start-Sleep -Seconds 5

# Start Logistics Hub in background
Write-Host "Starting Logistics Hub on port 5004..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd D:\MandiApp\Backend\Services\Logistics.Hub; dotnet run" -WindowStyle Normal

Write-Host ""
Write-Host "⏳ Waiting for services to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

Write-Host ""
Write-Host "✅ All services starting!" -ForegroundColor Green
Write-Host ""
Write-Host "Services are exposed via Cloudflare Tunnel at:" -ForegroundColor Cyan
Write-Host "  • Identity API: https://identity-api.mandimarket.com" -ForegroundColor White
Write-Host "  • Marketplace API: https://marketplace-api.mandimarket.com" -ForegroundColor White
Write-Host "  • Ordering API: https://ordering-api.mandimarket.com" -ForegroundColor White
Write-Host "  • Logistics Hub: https://logistics-hub.mandimarket.com" -ForegroundColor White
Write-Host ""
Write-Host "Frontend should use tunnel URLs in environment.ts" -ForegroundColor Yellow
Write-Host "Now you can test with real webhooks and external APIs!" -ForegroundColor Green
Write-Host ""
Write-Host "Press any key to check service status..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

# Test each service
Write-Host ""
Write-Host "Testing services..." -ForegroundColor Cyan

$services = @(
    @{Name="Identity API"; Port=5003; Url="https://identity-api.mandimarket.com"},
    @{Name="Marketplace API"; Port=5001; Url="https://marketplace-api.mandimarket.com"},
    @{Name="Ordering API"; Port=5002; Url="https://ordering-api.mandimarket.com"},
    @{Name="Logistics Hub"; Port=5004; Url="https://logistics-hub.mandimarket.com"}
)

foreach ($service in $services) {
    $result = Test-NetConnection -ComputerName localhost -Port $service.Port -WarningAction SilentlyContinue
    if ($result.TcpTestSucceeded) {
        Write-Host "✅ $($service.Name) - Running on port $($service.Port)" -ForegroundColor Green
        Write-Host "   Tunnel URL: $($service.Url)" -ForegroundColor Gray
    } else {
        Write-Host "❌ $($service.Name) - NOT running on port $($service.Port)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "To test OTP with real Twilio WhatsApp:" -ForegroundColor Yellow
Write-Host "1. Set EnableDevBypass=false in Identity.API appsettings.json" -ForegroundColor Gray
Write-Host "2. Restart Identity API" -ForegroundColor Gray
Write-Host "3. Login with your phone number" -ForegroundColor Gray
Write-Host "4. Receive OTP on WhatsApp!" -ForegroundColor Gray
Write-Host ""
Write-Host "Press Ctrl+C to exit" -ForegroundColor Yellow
