# Quick Restart Script for Frontend
Write-Host "🔄 Restarting Frontend with Swiper Updates..." -ForegroundColor Cyan

# Kill any existing ng serve processes
Get-Process | Where-Object { $_.ProcessName -match 'node' -and $_.CommandLine -match 'ng serve' } | ForEach-Object {
    Write-Host "Stopping existing frontend process (PID: $($_.Id))..." -ForegroundColor Yellow
    Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
}

Start-Sleep -Seconds 2

# Navigate to Frontend directory
Set-Location "Frontend"

Write-Host "✅ Starting frontend with updated Swiper styles..." -ForegroundColor Green
Write-Host "   - Added Swiper CSS imports" -ForegroundColor Gray
Write-Host "   - Applied theme-based styling" -ForegroundColor Gray
Write-Host "   - Fixed black background issue" -ForegroundColor Gray
Write-Host ""

# Start frontend
npm start
