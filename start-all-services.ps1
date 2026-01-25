# MandiApp - Quick Test Deployment Script
# Run this to test all services together

Write-Host "MandiApp - Starting All Services" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

# Check if all services are available
$services = @(
    @{Name="Identity.API"; Path="Backend\Services\Identity.API"; Port=5003},
    @{Name="Marketplace.API"; Path="Backend\Services\Marketplace.API"; Port=5001},
    @{Name="Ordering.API"; Path="Backend\Services\Ordering.API"; Port=5002},
    @{Name="Logistics.Hub"; Path="Backend\Services\Logistics.Hub"; Port=5004}
)

$rootPath = "d:\MandiApp"

Write-Host "Checking services..." -ForegroundColor Yellow
foreach ($service in $services) {
    $servicePath = Join-Path $rootPath $service.Path
    if (Test-Path $servicePath) {
        Write-Host "OK $($service.Name) found" -ForegroundColor Green
    } else {
        Write-Host "ERROR $($service.Name) NOT FOUND at $servicePath" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Starting services in separate terminals..." -ForegroundColor Yellow
Write-Host ""

# Start Identity.API
Start-Process powershell -ArgumentList "-NoExit","-Command","cd '$rootPath\Backend\Services\Identity.API'; Write-Host 'Identity.API Starting...' -ForegroundColor Cyan; Write-Host 'Port: 5003' -ForegroundColor Yellow; Write-Host 'Swagger: http://localhost:5003/swagger' -ForegroundColor Green; Write-Host ''; dotnet run"

Start-Sleep -Seconds 2

# Start Marketplace.API
Start-Process powershell -ArgumentList "-NoExit","-Command","cd '$rootPath\Backend\Services\Marketplace.API'; Write-Host 'Marketplace.API Starting...' -ForegroundColor Cyan; Write-Host 'Port: 5001' -ForegroundColor Yellow; Write-Host 'Swagger: http://localhost:5001/swagger' -ForegroundColor Green; Write-Host ''; dotnet run"

Start-Sleep -Seconds 2

# Start Ordering.API
Start-Process powershell -ArgumentList "-NoExit","-Command","cd '$rootPath\Backend\Services\Ordering.API'; Write-Host 'Ordering.API Starting...' -ForegroundColor Cyan; Write-Host 'Port: 5002' -ForegroundColor Yellow; Write-Host 'Swagger: http://localhost:5002/swagger' -ForegroundColor Green; Write-Host ''; dotnet run"

Start-Sleep -Seconds 2

# Start Logistics.Hub
Start-Process powershell -ArgumentList "-NoExit","-Command","cd '$rootPath\Backend\Services\Logistics.Hub'; Write-Host 'Logistics.Hub Starting...' -ForegroundColor Cyan; Write-Host 'Port: 5004' -ForegroundColor Yellow; Write-Host 'Swagger: http://localhost:5004/swagger' -ForegroundColor Green; Write-Host ''; dotnet run"

Write-Host ""
Write-Host "Waiting for services to start (15 seconds)..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

Write-Host ""
Write-Host "All services started!" -ForegroundColor Green
Write-Host ""
Write-Host "Service URLs:" -ForegroundColor Cyan
Write-Host "  Identity API:    http://localhost:5003/swagger" -ForegroundColor White
Write-Host "  Marketplace API: http://localhost:5001/swagger" -ForegroundColor White
Write-Host "  Ordering API:    http://localhost:5002/swagger" -ForegroundColor White
Write-Host "  Logistics Hub:   http://localhost:5004/swagger" -ForegroundColor White
Write-Host ""
Write-Host "To start the frontend:" -ForegroundColor Cyan
Write-Host "  cd $rootPath\Frontend" -ForegroundColor White
Write-Host "  npm start" -ForegroundColor White
Write-Host ""
Write-Host "Frontend will be available at: http://localhost:8100" -ForegroundColor Green
Write-Host ""
Write-Host "Database: Supabase (Connected)" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press any key to open Swagger UIs in browser..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

# Open Swagger UIs
Start-Process "http://localhost:5003/swagger"
Start-Sleep -Seconds 1
Start-Process "http://localhost:5001/swagger"
Start-Sleep -Seconds 1
Start-Process "http://localhost:5002/swagger"
Start-Sleep -Seconds 1
Start-Process "http://localhost:5004/swagger"

Write-Host ""
Write-Host "Ready for testing!" -ForegroundColor Green
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "1. Create test users via Identity API" -ForegroundColor White
Write-Host "2. Add products via Marketplace API" -ForegroundColor White
Write-Host "3. Test order flow via Ordering API" -ForegroundColor White
Write-Host "4. Start frontend and test UI" -ForegroundColor White
Write-Host ""
