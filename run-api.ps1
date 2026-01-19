# Run Mandi Ordering API
Write-Host "Starting Mandi Ordering API..." -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Cyan

# Add dotnet to PATH
$env:PATH = $env:PATH + ";C:\Program Files\dotnet"

# Change to project directory
Set-Location "d:\MandiApp\Backend\Services\Ordering.API"

# Run the API
Write-Host "`nAPI will start on: http://localhost:5000" -ForegroundColor Yellow
Write-Host "Swagger UI: http://localhost:5000/swagger`n" -ForegroundColor Yellow

dotnet run

Write-Host "`n===============================================" -ForegroundColor Cyan
Write-Host "API Stopped" -ForegroundColor Red
