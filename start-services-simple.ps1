# Simple Service Starter - Runs all in current terminal
$rootPath = "d:\MandiApp"

Write-Host "Starting Identity.API..." -ForegroundColor Cyan
Start-Job -ScriptBlock {
    Set-Location "d:\MandiApp\Backend\Services\Identity.API"
    dotnet run
} -Name "Identity"

Write-Host "Starting Marketplace.API..." -ForegroundColor Cyan
Start-Job -ScriptBlock {
    Set-Location "d:\MandiApp\Backend\Services\Marketplace.API"
    dotnet run
} -Name "Marketplace"

Write-Host "Starting Ordering.API..." -ForegroundColor Cyan
Start-Job -ScriptBlock {
    Set-Location "d:\MandiApp\Backend\Services\Ordering.API"
    dotnet run
} -Name "Ordering"

Write-Host "Starting Logistics.Hub..." -ForegroundColor Cyan
Start-Job -ScriptBlock {
    Set-Location "d:\MandiApp\Backend\Services\Logistics.Hub"
    dotnet run
} -Name "Logistics"

Write-Host "`nWaiting for services to start (30 seconds)..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

Write-Host "`nChecking service status..." -ForegroundColor Cyan
Get-Job | Format-Table

Write-Host "`nTesting endpoints..." -ForegroundColor Cyan
$ports = @(5003, 5001, 5002, 5004)
$names = @("Identity", "Marketplace", "Ordering", "Logistics")

for ($i = 0; $i -lt $ports.Length; $i++) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:$($ports[$i])/api/health" -UseBasicParsing -TimeoutSec 5
        Write-Host "$($names[$i]) API (Port $($ports[$i])): OK" -ForegroundColor Green
    } catch {
        Write-Host "$($names[$i]) API (Port $($ports[$i])): FAILED - $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "Checking job output..." -ForegroundColor Yellow
        Receive-Job -Name $names[$i] | Select-Object -Last 10
    }
}

Write-Host "`nTo stop services: Get-Job | Stop-Job; Get-Job | Remove-Job" -ForegroundColor Yellow
