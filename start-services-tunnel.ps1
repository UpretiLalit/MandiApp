# Kill existing dotnet processes
Write-Host "Stopping existing services..." -ForegroundColor Yellow
Get-Process -Name dotnet -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 3

Write-Host "Starting services for Cloudflare Tunnel..." -ForegroundColor Green
Write-Host ""

# Start Identity API
Write-Host "[1/4] Starting Identity API on http://localhost:5003..." -ForegroundColor Cyan
Start-Job -ScriptBlock {
    Set-Location "D:\MandiApp\Backend\Services\Identity.API"
    $env:ASPNETCORE_ENVIRONMENT = "Development"
    $env:ASPNETCORE_URLS = "http://0.0.0.0:5003"
    dotnet run 2>&1
} -Name "Identity.API" | Out-Null

Start-Sleep -Seconds 8

# Start Marketplace API  
Write-Host "[2/4] Starting Marketplace API on http://localhost:5001..." -ForegroundColor Cyan
Start-Job -ScriptBlock {
    Set-Location "D:\MandiApp\Backend\Services\Marketplace.API"
    $env:ASPNETCORE_ENVIRONMENT = "Development"
    $env:ASPNETCORE_URLS = "http://0.0.0.0:5001"
    dotnet run 2>&1
} -Name "Marketplace.API" | Out-Null

Start-Sleep -Seconds 8

# Start Ordering API
Write-Host "[3/4] Starting Ordering API on http://localhost:5002..." -ForegroundColor Cyan
Start-Job -ScriptBlock {
    Set-Location "D:\MandiApp\Backend\Services\Ordering.API"
    $env:ASPNETCORE_ENVIRONMENT = "Development"
    $env:ASPNETCORE_URLS = "http://0.0.0.0:5002"
    dotnet run 2>&1
} -Name "Ordering.API" | Out-Null

Start-Sleep -Seconds 8

# Start Logistics Hub
Write-Host "[4/4] Starting Logistics Hub on http://localhost:5004..." -ForegroundColor Cyan
Start-Job -ScriptBlock {
    Set-Location "D:\MandiApp\Backend\Services\Logistics.Hub"
    $env:ASPNETCORE_ENVIRONMENT = "Development"
    $env:ASPNETCORE_URLS = "http://0.0.0.0:5004"
    dotnet run 2>&1
} -Name "Logistics.Hub" | Out-Null

Write-Host ""
Write-Host "Waiting for services to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

Write-Host ""
Write-Host "Checking service status..." -ForegroundColor Cyan
Write-Host ""

# Check each port
$ports = @(
    @{Port=5003; Name="Identity API"; Url="https://identity-api.mandimarket.com"},
    @{Port=5001; Name="Marketplace API"; Url="https://marketplace-api.mandimarket.com"},
    @{Port=5002; Name="Ordering API"; Url="https://ordering-api.mandimarket.com"},
    @{Port=5004; Name="Logistics Hub"; Url="https://logistics-hub.mandimarket.com"}
)

foreach ($service in $ports) {
    $connection = Test-NetConnection -ComputerName localhost -Port $service.Port -WarningAction SilentlyContinue -InformationLevel Quiet
    if ($connection) {
        Write-Host "✅ $($service.Name) - Running on port $($service.Port)" -ForegroundColor Green
        Write-Host "   Tunnel: $($service.Url)" -ForegroundColor Gray
    } else {
        Write-Host "❌ $($service.Name) - NOT running on port $($service.Port)" -ForegroundColor Red
        Write-Host "   Check job output: Receive-Job -Name '$($service.Name)'" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "To see service logs:" -ForegroundColor Yellow
Write-Host "  Get-Job | Format-Table" -ForegroundColor Gray
Write-Host "  Receive-Job -Name 'Identity.API' -Keep" -ForegroundColor Gray
Write-Host ""
Write-Host "To stop all services:" -ForegroundColor Yellow
Write-Host "  Get-Job | Stop-Job; Get-Job | Remove-Job" -ForegroundColor Gray
Write-Host ""

# Test tunnel connectivity
Write-Host "Testing tunnel connectivity..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "https://identity-api.mandimarket.com/api/health" -Method GET -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
    Write-Host "✅ Tunnel is working! Status: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Tunnel test failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   Make sure Cloudflare Tunnel is running!" -ForegroundColor Yellow
}

Write-Host ""
