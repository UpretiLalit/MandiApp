# Quick Test Script - MandiApp Deployment
# Tests all public endpoints via Cloudflare Tunnel

Write-Host "`n=== MandiApp Deployment Test ===" -ForegroundColor Cyan
Write-Host ""

$endpoints = @(
    @{Name="Identity API Health"; Url="https://identity-api.mandiapp.in/api/health"},
    @{Name="Marketplace API Health"; Url="https://marketplace-api.mandiapp.in/api/health"},
    @{Name="Ordering API Health"; Url="https://ordering-api.mandiapp.in/api/health"},
    @{Name="Logistics Hub Health"; Url="https://logistics-hub.mandiapp.in/api/health"}
)

Write-Host "Testing Public Endpoints..." -ForegroundColor Yellow
Write-Host ""

foreach ($endpoint in $endpoints) {
    Write-Host "Testing: $($endpoint.Name)" -ForegroundColor White
    Write-Host "  URL: $($endpoint.Url)" -ForegroundColor Gray
    
    try {
        $response = Invoke-WebRequest -Uri $endpoint.Url -Method GET -TimeoutSec 10 -UseBasicParsing
        
        if ($response.StatusCode -eq 200) {
            Write-Host "  Status: OK (200)" -ForegroundColor Green
            Write-Host "  Response: $($response.Content)" -ForegroundColor Gray
        } else {
            Write-Host "  Status: $($response.StatusCode)" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "  Status: FAILED" -ForegroundColor Red
        Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
        
        if ($_.Exception.Message -like "*Could not resolve host*" -or $_.Exception.Message -like "*Unable to connect*") {
            Write-Host "  Hint: Make sure Cloudflare tunnel is running!" -ForegroundColor Yellow
        }
    }
    
    Write-Host ""
}

Write-Host "=== Swagger UI Links ===" -ForegroundColor Cyan
Write-Host "Identity API:    https://identity-api.mandiapp.in/swagger" -ForegroundColor White
Write-Host "Marketplace API: https://marketplace-api.mandiapp.in/swagger" -ForegroundColor White
Write-Host "Ordering API:    https://ordering-api.mandiapp.in/swagger" -ForegroundColor White
Write-Host "Logistics Hub:   https://logistics-hub.mandiapp.in/swagger" -ForegroundColor White
Write-Host ""

Write-Host "=== SignalR WebSocket Endpoints ===" -ForegroundColor Cyan
Write-Host "Price Hub:    wss://ordering-api.mandiapp.in/hubs/price" -ForegroundColor White
Write-Host "Tracking Hub: wss://logistics-hub.mandiapp.in/hubs/tracking" -ForegroundColor White
Write-Host ""

Write-Host "=== Next Steps ===" -ForegroundColor Cyan
Write-Host "1. If all tests passed, open Swagger UIs in browser" -ForegroundColor White
Write-Host "2. Test authentication: POST /api/auth/send-otp" -ForegroundColor White
Write-Host "3. Test products: GET /api/products" -ForegroundColor White
Write-Host "4. Start frontend: cd Frontend && ng serve --configuration=tunnel" -ForegroundColor White
Write-Host ""

Write-Host "Press any key to open Swagger UIs in browser..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

Start-Process "https://identity-api.mandiapp.in/swagger"
Start-Sleep -Seconds 1
Start-Process "https://marketplace-api.mandiapp.in/swagger"
Start-Sleep -Seconds 1
Start-Process "https://ordering-api.mandiapp.in/swagger"
Start-Sleep -Seconds 1
Start-Process "https://logistics-hub.mandiapp.in/swagger"

Write-Host ""
Write-Host "Swagger UIs opened in browser!" -ForegroundColor Green
Write-Host ""
