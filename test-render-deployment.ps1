# Test Deployed APIs on Render
# This script tests all your deployed endpoints

param(
    [string]$IdentityApi = "https://mandiapp-identity-api.onrender.com",
    [string]$MarketplaceApi = "https://mandiapp-marketplace-api.onrender.com",
    [string]$OrderingApi = "https://mandiapp-ordering-api.onrender.com",
    [string]$LogisticsApi = "https://mandiapp-logistics-hub.onrender.com"
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Testing MandiApp APIs on Render" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "NOTE: First request takes ~30 seconds (waking up from sleep)" -ForegroundColor Yellow
Write-Host ""

# Test Identity API
Write-Host "[1/4] Testing Identity API..." -ForegroundColor Yellow
Write-Host "URL: $IdentityApi" -ForegroundColor Gray
try {
    Write-Host "  Trying GET /" -ForegroundColor Cyan
    $response = Invoke-WebRequest -Uri "$IdentityApi/" -Method GET -TimeoutSec 60 -UseBasicParsing
    Write-Host "  Status: $($response.StatusCode) - OK" -ForegroundColor Green
} catch {
    try {
        Write-Host "  Trying GET /api/auth" -ForegroundColor Cyan
        $response = Invoke-WebRequest -Uri "$IdentityApi/api/auth" -Method GET -TimeoutSec 60 -UseBasicParsing
        Write-Host "  Status: $($response.StatusCode) - OK" -ForegroundColor Green
    } catch {
        Write-Host "  Status: $($_.Exception.Response.StatusCode.value__) - $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "  Check Render logs for errors" -ForegroundColor Yellow
    }
}
Write-Host ""

# Test Marketplace API
Write-Host "[2/4] Testing Marketplace API..." -ForegroundColor Yellow
Write-Host "URL: $MarketplaceApi" -ForegroundColor Gray
try {
    Write-Host "  Trying GET /api/products" -ForegroundColor Cyan
    $response = Invoke-WebRequest -Uri "$MarketplaceApi/api/products" -Method GET -TimeoutSec 60 -UseBasicParsing
    Write-Host "  Status: $($response.StatusCode) - OK" -ForegroundColor Green
    Write-Host "  Response: $($response.Content.Substring(0, [Math]::Min(100, $response.Content.Length)))..." -ForegroundColor Gray
} catch {
    Write-Host "  Status: $($_.Exception.Response.StatusCode.value__) - $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test Ordering API
Write-Host "[3/4] Testing Ordering API..." -ForegroundColor Yellow
Write-Host "URL: $OrderingApi" -ForegroundColor Gray
try {
    Write-Host "  Trying GET /api/orders" -ForegroundColor Cyan
    $response = Invoke-WebRequest -Uri "$OrderingApi/api/orders" -Method GET -TimeoutSec 60 -UseBasicParsing
    Write-Host "  Status: $($response.StatusCode) - OK" -ForegroundColor Green
} catch {
    Write-Host "  Status: $($_.Exception.Response.StatusCode.value__) - $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test Logistics Hub
Write-Host "[4/4] Testing Logistics Hub..." -ForegroundColor Yellow
Write-Host "URL: $LogisticsApi" -ForegroundColor Gray
try {
    Write-Host "  Trying GET /api/delivery" -ForegroundColor Cyan
    $response = Invoke-WebRequest -Uri "$LogisticsApi/api/delivery" -Method GET -TimeoutSec 60 -UseBasicParsing
    Write-Host "  Status: $($response.StatusCode) - OK" -ForegroundColor Green
} catch {
    Write-Host "  Status: $($_.Exception.Response.StatusCode.value__) - $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Swagger Documentation URLs" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Identity API: $IdentityApi/swagger" -ForegroundColor White
Write-Host "Marketplace API: $MarketplaceApi/swagger" -ForegroundColor White
Write-Host "Ordering API: $OrderingApi/swagger" -ForegroundColor White
Write-Host "Logistics Hub: $LogisticsApi/swagger" -ForegroundColor White
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Register a Test User" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$createUser = Read-Host "Create a test user now? (yes/no)"
if ($createUser -eq "yes") {
    Write-Host ""
    Write-Host "Creating test buyer..." -ForegroundColor Yellow
    
    $testUser = @{
        phoneNumber = "+919876543210"
        password = "Test@123"
        fullName = "Test Buyer"
        email = "testbuyer@example.com"
        role = "Buyer"
    } | ConvertTo-Json
    
    try {
        Write-Host "Sending registration request (may take 30 seconds)..." -ForegroundColor Cyan
        $response = Invoke-RestMethod -Uri "$IdentityApi/api/auth/register" `
            -Method POST `
            -ContentType "application/json" `
            -Body $testUser `
            -TimeoutSec 60
        
        Write-Host ""
        Write-Host "SUCCESS! User created:" -ForegroundColor Green
        Write-Host "  Phone: +919876543210" -ForegroundColor White
        Write-Host "  Password: Test@123" -ForegroundColor White
        Write-Host "  User ID: $($response.userId)" -ForegroundColor Gray
        Write-Host ""
        
        # Try to login
        Write-Host "Testing login..." -ForegroundColor Yellow
        $loginData = @{
            phoneNumber = "+919876543210"
            password = "Test@123"
        } | ConvertTo-Json
        
        $loginResponse = Invoke-RestMethod -Uri "$IdentityApi/api/auth/login" `
            -Method POST `
            -ContentType "application/json" `
            -Body $loginData `
            -TimeoutSec 60
        
        Write-Host "Login SUCCESS!" -ForegroundColor Green
        Write-Host "Token: $($loginResponse.token.Substring(0, 30))..." -ForegroundColor Gray
        Write-Host ""
        
        # Save credentials
        $credentials = @{
            phone = "+919876543210"
            password = "Test@123"
            token = $loginResponse.token
            userId = $response.userId
        } | ConvertTo-Json
        
        $credentials | Out-File -FilePath "test-credentials.json" -Encoding UTF8
        Write-Host "Credentials saved to: test-credentials.json" -ForegroundColor Green
        
    } catch {
        Write-Host ""
        Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host ""
        if ($_.Exception.Response) {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $errorDetails = $reader.ReadToEnd()
            Write-Host "Details: $errorDetails" -ForegroundColor Yellow
        }
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Next Steps" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Open Swagger UI to test APIs:" -ForegroundColor Yellow
Write-Host "   $IdentityApi/swagger" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. Create multiple test users:" -ForegroundColor Yellow
Write-Host "   .\create-test-users-api.ps1 -IdentityApiUrl $IdentityApi" -ForegroundColor Cyan
Write-Host ""
Write-Host "3. Check Render logs if any service fails" -ForegroundColor Yellow
Write-Host ""
