# ============================================
# MandiApp Quick Start (Simple Version)
# ============================================

# Refresh PATH
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

Write-Host "Starting MandiApp..." -ForegroundColor Green

# Start Backend in new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'D:\MandiApp\Backend\Services\Ordering.API'; Write-Host 'Backend API Starting...' -ForegroundColor Cyan; dotnet run"

# Wait 3 seconds
Start-Sleep -Seconds 3

# Start Frontend in new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'D:\MandiApp\Frontend'; Write-Host 'Frontend UI Starting...' -ForegroundColor Cyan; ng serve --open"

Write-Host ""
Write-Host "Services starting in separate windows..." -ForegroundColor Green
Write-Host "   Backend API: http://localhost:5002" -ForegroundColor Yellow
Write-Host "   Frontend UI: http://localhost:4200" -ForegroundColor Yellow
Write-Host ""
Write-Host "Close each window to stop that service" -ForegroundColor Gray
