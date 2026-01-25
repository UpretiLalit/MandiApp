# Quick Test Script - MandiApp Deployment (mandimarket.com)
# Tests all public endpoints via Cloudflare Tunnel

Write-Host "`n=== MandiApp Deployment Test ===" -ForegroundColor Cyan
Write-Host ""

$endpoints = @(
    @{Name="Identity API Health"; Url="https://identity-api.mandiapp.in.mandimarket.com/api/health"},
    @{Name="Marketplace API Health"; Url="https://marketplace-api.mandiapp.in.mandimarket.com/api/health"},
    @{Name="Ordering API Health"; Url="https://ordering-api.mandiapp.in.mandimarket.com/api/health"},
    @{Name="Logistics Hub Health"; Url="https://logistics-hub.mandiapp.in.mandimarket.com/api/health"}
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
    }
    
    Write-Host ""
}

Write-Host "=== Swagger UI Links ===" -ForegroundColor Cyan
Write-Host "Identity API:    https://identity-api.mandiapp.in.mandimarket.com/swagger" -ForegroundColor White
Write-Host "Marketplace API: https://marketplace-api.mandiapp.in.mandimarket.com/swagger" -ForegroundColor White
Write-Host "Ordering API:    https://ordering-api.mandiapp.in.mandimarket.com/swagger" -ForegroundColor White
Write-Host "Logistics Hub:   https://logistics-hub.mandiapp.in.mandimarket.com/swagger" -ForegroundColor White
Write-Host ""

Write-Host "Press any key to open Swagger UIs..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

Start-Process "https://identity-api.mandiapp.in.mandimarket.com/swagger"
Start-Sleep -Seconds 1
Start-Process "https://marketplace-api.mandiapp.in.mandimarket.com/swagger"
Start-Sleep -Seconds 1
Start-Process "https://ordering-api.mandiapp.in.mandimarket.com/swagger"
Start-Sleep -Seconds 1
Start-Process "https://logistics-hub.mandiapp.in.mandimarket.com/swagger"
