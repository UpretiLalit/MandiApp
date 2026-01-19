# ============================================
# MandiApp Development Startup Script
# ============================================
# This script starts both backend API and frontend simultaneously

Write-Host "🚀 Starting MandiApp Development Environment..." -ForegroundColor Green
Write-Host ""

# Refresh PATH to ensure dotnet and ng are available
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

# Start Backend API (Ordering.API)
Write-Host "📡 Starting Backend API (Port 5002)..." -ForegroundColor Cyan
$backendJob = Start-Job -ScriptBlock {
    Set-Location "D:\MandiApp\Backend\Services\Ordering.API"
    dotnet run
}

# Wait a moment for backend to initialize
Start-Sleep -Seconds 3

# Start Frontend (Angular)
Write-Host "🎨 Starting Frontend UI (Port 4200)..." -ForegroundColor Cyan
$frontendJob = Start-Job -ScriptBlock {
    Set-Location "D:\MandiApp\Frontend"
    ng serve --open
}

Write-Host ""
Write-Host "✅ Services Starting..." -ForegroundColor Green
Write-Host "   Backend API: http://localhost:5002" -ForegroundColor Yellow
Write-Host "   Frontend UI: http://localhost:4200" -ForegroundColor Yellow
Write-Host ""
Write-Host "💡 Press Ctrl+C to stop both services" -ForegroundColor Gray
Write-Host ""

# Monitor jobs and display output
try {
    while ($true) {
        # Check if jobs are still running
        if ($backendJob.State -ne 'Running' -and $frontendJob.State -ne 'Running') {
            Write-Host "⚠️  Both services stopped" -ForegroundColor Red
            break
        }

        # Get and display job output
        $backendOutput = Receive-Job -Job $backendJob -ErrorAction SilentlyContinue
        $frontendOutput = Receive-Job -Job $frontendJob -ErrorAction SilentlyContinue

        if ($backendOutput) {
            Write-Host "[Backend] $backendOutput" -ForegroundColor Blue
        }
        if ($frontendOutput) {
            Write-Host "[Frontend] $frontendOutput" -ForegroundColor Magenta
        }

        Start-Sleep -Milliseconds 500
    }
}
finally {
    # Cleanup: Stop all jobs when script exits
    Write-Host ""
    Write-Host "🛑 Stopping services..." -ForegroundColor Yellow
    Stop-Job -Job $backendJob, $frontendJob -ErrorAction SilentlyContinue
    Remove-Job -Job $backendJob, $frontendJob -Force -ErrorAction SilentlyContinue
    Write-Host "✅ All services stopped" -ForegroundColor Green
}
