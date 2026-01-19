# SignalR Price Update Test Script

Write-Host "🚀 SignalR Real-Time Price Update Test" -ForegroundColor Cyan
Write-Host "======================================`n" -ForegroundColor Cyan

$baseUrl = "http://localhost:5002/api/pricetest"

# Test 1: Simulate Random Price Drop
Write-Host "📊 Test 1: Simulating Random Price Drop..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/simulate-price-drop" -Method Post
    Write-Host "✅ Success: $($response.message)" -ForegroundColor Green
    Write-Host "   Product: $($response.data.productId)" -ForegroundColor Gray
    Write-Host "   Vendor: $($response.data.vendorId)" -ForegroundColor Gray
    Write-Host "   New Price: ₹$($response.data.newPrice)`n" -ForegroundColor Gray
} catch {
    Write-Host "❌ Failed: $($_.Exception.Message)`n" -ForegroundColor Red
}

Start-Sleep -Seconds 2

# Test 2: Update Tomato Price from Vendor 1
Write-Host "🍅 Test 2: Updating Tomato Price (Product 1, Vendor 1)..." -ForegroundColor Yellow
$body = @{
    productId = "1"
    vendorId = "1"
    newPrice = 38.50
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/update-price" -Method Post -Body $body -ContentType "application/json"
    Write-Host "✅ Success: $($response.message)" -ForegroundColor Green
    Write-Host "   Fresh Tomatoes → ₹38.50`n" -ForegroundColor Gray
} catch {
    Write-Host "❌ Failed: $($_.Exception.Message)`n" -ForegroundColor Red
}

Start-Sleep -Seconds 2

# Test 3: Update Onion Price from Vendor 2 (Lower Price)
Write-Host "🧅 Test 3: Dropping Onion Price (Product 3, Vendor 2)..." -ForegroundColor Yellow
$body = @{
    productId = "3"
    vendorId = "2"
    newPrice = 25.00
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/update-price" -Method Post -Body $body -ContentType "application/json"
    Write-Host "✅ Success: $($response.message)" -ForegroundColor Green
    Write-Host "   Onions → ₹25.00 (New Best Price!)`n" -ForegroundColor Gray
} catch {
    Write-Host "❌ Failed: $($_.Exception.Message)`n" -ForegroundColor Red
}

Start-Sleep -Seconds 2

# Test 4: Update Apple Price from Vendor 2
Write-Host "🍎 Test 4: Updating Apple Price (Product 7, Vendor 2)..." -ForegroundColor Yellow
$body = @{
    productId = "7"
    vendorId = "2"
    newPrice = 85.00
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/update-price" -Method Post -Body $body -ContentType "application/json"
    Write-Host "✅ Success: $($response.message)" -ForegroundColor Green
    Write-Host "   Apples → ₹85.00`n" -ForegroundColor Gray
} catch {
    Write-Host "❌ Failed: $($_.Exception.Message)`n" -ForegroundColor Red
}

Start-Sleep -Seconds 2

# Test 5: Multiple Rapid Updates
Write-Host "⚡ Test 5: Rapid Fire - Multiple Price Updates..." -ForegroundColor Yellow
$updates = @(
    @{ productId = "5"; vendorId = "2"; newPrice = 23.50 },
    @{ productId = "9"; vendorId = "1"; newPrice = 48.00 },
    @{ productId = "6"; vendorId = "2"; newPrice = 33.00 }
)

foreach ($update in $updates) {
    $body = $update | ConvertTo-Json
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/update-price" -Method Post -Body $body -ContentType "application/json"
        Write-Host "  ✅ Product $($update.productId) → ₹$($update.newPrice)" -ForegroundColor Green
    } catch {
        Write-Host "  ❌ Failed for Product $($update.productId)" -ForegroundColor Red
    }
    Start-Sleep -Milliseconds 500
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "🎉 Test Complete!" -ForegroundColor Cyan
Write-Host "Check your browser marketplace page for:" -ForegroundColor White
Write-Host "  • Green flash animations" -ForegroundColor Green
Write-Host "  • Updated prices" -ForegroundColor Green
Write-Host "  • Toast notifications" -ForegroundColor Green
Write-Host "  • Recalculated best prices" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Cyan
