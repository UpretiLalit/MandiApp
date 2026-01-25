# Test Script - Correct Domain (mandimarket.com)

Write-Host "`n=== Testing MandiApp APIs ===" -ForegroundColor Cyan
Write-Host ""

$endpoints = @(
    @{Name="Identity API"; Url="https://identity-api.mandimarket.com/api/health"},
    @{Name="Marketplace API"; Url="https://marketplace-api.mandimarket.com/api/health"},
    @{Name="Ordering API"; Url="https://ordering-api.mandimarket.com/api/health"},
    @{Name="Logistics Hub"; Url="https://logistics-hub.mandimarket.com/api/health"}
)

Write-Host "Waiting for DNS propagation (30 seconds)..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

foreach ($endpoint in $endpoints) {
    Write-Host "`nTesting: $($endpoint.Name)" -ForegroundColor White
    Write-Host "URL: $($endpoint.Url)" -ForegroundColor Gray
    
    try {
        $response = Invoke-WebRequest -Uri $endpoint.Url -Method GET -TimeoutSec 10 -UseBasicParsing
        Write-Host "Status: OK ✓" -ForegroundColor Green
        Write-Host "Response: $($response.Content)" -ForegroundColor Gray
    } catch {
        Write-Host "Status: FAILED ✗" -ForegroundColor Red
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`n=== Your API URLs ===" -ForegroundColor Cyan
Write-Host "Identity:    https://identity-api.mandimarket.com" -ForegroundColor White
Write-Host "Marketplace: https://marketplace-api.mandimarket.com" -ForegroundColor White
Write-Host "Ordering:    https://ordering-api.mandimarket.com" -ForegroundColor White
Write-Host "Logistics:   https://logistics-hub.mandimarket.com" -ForegroundColor White

Write-Host "`n=== Swagger UIs ===" -ForegroundColor Cyan
Write-Host "Identity:    https://identity-api.mandimarket.com/swagger" -ForegroundColor White
Write-Host "Marketplace: https://marketplace-api.mandimarket.com/swagger" -ForegroundColor White
Write-Host "Ordering:    https://ordering-api.mandimarket.com/swagger" -ForegroundColor White
Write-Host "Logistics:   https://logistics-hub.mandimarket.com/swagger" -ForegroundColor White

Write-Host "`nPress any key to open Swagger UIs..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

Start-Process "https://identity-api.mandimarket.com/swagger"
Start-Process "https://marketplace-api.mandimarket.com/swagger"
Start-Process "https://ordering-api.mandimarket.com/swagger"
Start-Process "https://logistics-hub.mandimarket.com/swagger"
