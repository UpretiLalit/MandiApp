#!/usr/bin/env pwsh
# Real-Time Feature Test Script
# Run this to test all SignalR and real-time features

Write-Host "🚀 Mandi App - Real-Time Feature Tester" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if backend is running
Write-Host "1️⃣  Checking Backend Status..." -ForegroundColor Yellow
$backendRunning = $false
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5002/api/logistics/heatmap" -Method GET -UseBasicParsing -TimeoutSec 2
    if ($response.StatusCode -eq 200) {
        Write-Host "   ✅ Backend is running on port 5002" -ForegroundColor Green
        $backendRunning = $true
    }
} catch {
    Write-Host "   ❌ Backend is NOT running!" -ForegroundColor Red
    Write-Host "   Start it with: cd D:\MandiApp\Backend\Services\Ordering.API; dotnet run" -ForegroundColor Yellow
}

Write-Host ""

# Check if frontend is running
Write-Host "2️⃣  Checking Frontend Status..." -ForegroundColor Yellow
$frontendRunning = $false
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8100" -Method GET -UseBasicParsing -TimeoutSec 2
    if ($response.StatusCode -eq 200) {
        Write-Host "   ✅ Frontend is running on port 8100" -ForegroundColor Green
        $frontendRunning = $true
    }
} catch {
    Write-Host "   ❌ Frontend is NOT running!" -ForegroundColor Red
    Write-Host "   Start it with: cd D:\MandiApp\Frontend; npm start" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

if (!$backendRunning) {
    Write-Host "⚠️  Cannot test - Backend not running!" -ForegroundColor Red
    Write-Host "   Start backend first and run this script again." -ForegroundColor Yellow
    exit 1
}

# Menu
Write-Host "Select test to run:" -ForegroundColor Cyan
Write-Host "  1. Test Price Update (Single)" -ForegroundColor White
Write-Host "  2. Simulate Continuous Price Changes (Auto)" -ForegroundColor White
Write-Host "  3. Test Logistics Heatmap" -ForegroundColor White
Write-Host "  4. Test Stuck Orders Detection" -ForegroundColor White
Write-Host "  5. Run All Tests" -ForegroundColor White
Write-Host "  6. Exit" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Enter choice (1-6)"

function Test-PriceUpdate {
    Write-Host ""
    Write-Host "📊 Testing Price Update via SignalR..." -ForegroundColor Cyan
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:5002/api/pricetest/simulate-price-drop" -Method POST
        Write-Host "   ✅ Price update broadcasted successfully!" -ForegroundColor Green
        Write-Host "   📦 Updated Products:" -ForegroundColor Yellow
        $response | ForEach-Object {
            Write-Host "      - $($_.productName): ₹$($_.oldPrice) → ₹$($_.newPrice) (VendorId: $($_.vendorId))" -ForegroundColor White
        }
        Write-Host ""
        Write-Host "   👀 Check your browser - prices should flash GREEN!" -ForegroundColor Magenta
    } catch {
        Write-Host "   ❌ Failed: $_" -ForegroundColor Red
    }
}

function Start-ContinuousPriceUpdates {
    Write-Host ""
    Write-Host "🔄 Starting Continuous Price Updates..." -ForegroundColor Cyan
    Write-Host "   Press Ctrl+C to stop" -ForegroundColor Yellow
    Write-Host ""
    
    $count = 0
    while ($true) {
        try {
            $count++
            $response = Invoke-RestMethod -Uri "http://localhost:5002/api/pricetest/simulate-price-drop" -Method POST
            Write-Host "[$count] Price update sent - $(Get-Date -Format 'HH:mm:ss')" -ForegroundColor Green
            
            # Show brief summary
            $productCount = $response.Count
            Write-Host "    Updated $productCount products" -ForegroundColor Gray
            
            Start-Sleep -Seconds 10
        } catch {
            Write-Host "   ❌ Error: $_" -ForegroundColor Red
            Start-Sleep -Seconds 5
        }
    }
}

function Test-LogisticsHeatmap {
    Write-Host ""
    Write-Host "🗺️  Testing Logistics Heatmap..." -ForegroundColor Cyan
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:5002/api/logistics/heatmap" -Method GET
        Write-Host "   ✅ Heatmap data retrieved successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "   📊 Mandi Activity:" -ForegroundColor Yellow
        $response | ForEach-Object {
            $intensity = switch ($_.orderIntensity) {
                { $_ -ge 15 } { "🔴 HIGH" }
                { $_ -ge 8 } { "🟡 MEDIUM" }
                default { "🟢 LOW" }
            }
            Write-Host "      - $($_.mandiName): $intensity ($($_.orderIntensity) orders, $($_.availableTransporters) transporters)" -ForegroundColor White
        }
    } catch {
        Write-Host "   ❌ Failed: $_" -ForegroundColor Red
    }
}

function Test-StuckOrders {
    Write-Host ""
    Write-Host "⏱️  Testing Stuck Orders Detection..." -ForegroundColor Cyan
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:5002/api/logistics/stuck-orders?threshold=30" -Method GET
        Write-Host "   ✅ Stuck orders check completed!" -ForegroundColor Green
        
        if ($response.Count -eq 0) {
            Write-Host "   ✅ No stuck orders found - all good! 🎉" -ForegroundColor Green
        } else {
            Write-Host ""
            Write-Host "   ⚠️  Found $($response.Count) stuck orders:" -ForegroundColor Yellow
            $response | ForEach-Object {
                Write-Host "      - Order #$($_.orderId): Stuck for $($_.minutesStuck) mins" -ForegroundColor White
                Write-Host "        From: $($_.mandiName) → $($_.buyerLocation)" -ForegroundColor Gray
            }
        }
    } catch {
        Write-Host "   ❌ Failed: $_" -ForegroundColor Red
    }
}

# Execute based on choice
switch ($choice) {
    "1" { Test-PriceUpdate }
    "2" { Start-ContinuousPriceUpdates }
    "3" { Test-LogisticsHeatmap }
    "4" { Test-StuckOrders }
    "5" {
        Test-PriceUpdate
        Start-Sleep -Seconds 2
        Test-LogisticsHeatmap
        Start-Sleep -Seconds 2
        Test-StuckOrders
    }
    "6" {
        Write-Host "Goodbye! 👋" -ForegroundColor Cyan
        exit 0
    }
    default {
        Write-Host "Invalid choice!" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✅ Test Complete!" -ForegroundColor Green
Write-Host ""

# Show next steps
if ($frontendRunning) {
    Write-Host "🌐 Open browser: http://localhost:8100" -ForegroundColor Cyan
    Write-Host "📱 Login as Admin: 8287433081 (OTP: 123456)" -ForegroundColor Cyan
    Write-Host "📊 Navigate to Marketplace to see live price updates!" -ForegroundColor Cyan
} else {
    Write-Host "💡 Start frontend to see visual updates:" -ForegroundColor Yellow
    Write-Host "   cd D:\MandiApp\Frontend; npm start" -ForegroundColor Gray
}

Write-Host ""
