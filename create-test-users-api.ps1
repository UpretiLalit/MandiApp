# Create Test Users via API for Real-time Testing
# Run this AFTER your Identity API is deployed

param(
    [Parameter(Mandatory=$true)]
    [string]$IdentityApiUrl  # e.g., https://mandiapp-identity.railway.app
)

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Creating Test Users for Real-time Testing" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Identity API: $IdentityApiUrl" -ForegroundColor White
Write-Host ""

# Test users data
$testUsers = @(
    @{
        role = "Buyer"
        users = @(
            @{
                fullName = "Rajesh Kumar"
                phoneNumber = "+919876543210"
                password = "Test@123"
                email = "rajesh@hotelgrand.com"
                companyName = "Hotel Grand"
                address = "MG Road, Ahmedabad"
            },
            @{
                fullName = "Priya Shah"
                phoneNumber = "+919876543211"
                password = "Test@123"
                email = "priya@restaurant.com"
                companyName = "Priya Restaurant"
                address = "CG Road, Ahmedabad"
            }
        )
    },
    @{
        role = "Vendor"
        users = @(
            @{
                fullName = "Ramesh Patel"
                phoneNumber = "+919876543220"
                password = "Test@123"
                email = "ramesh@freshveggies.com"
                businessName = "Fresh Veggies Co."
                address = "APMC Market, Ahmedabad"
            },
            @{
                fullName = "Suresh Mehta"
                phoneNumber = "+919876543221"
                password = "Test@123"
                email = "suresh@greenvalley.com"
                businessName = "Green Valley Suppliers"
                address = "Sardar Patel Market, Ahmedabad"
            },
            @{
                fullName = "Mahesh Kumar"
                phoneNumber = "+919876543222"
                password = "Test@123"
                email = "mahesh@fruitking.com"
                businessName = "Fruit King"
                address = "City Market, Ahmedabad"
            }
        )
    },
    @{
        role = "Transporter"
        users = @(
            @{
                fullName = "Vikram Singh"
                phoneNumber = "+919876543230"
                password = "Test@123"
                email = "vikram@fastdelivery.com"
                vehicleNumber = "GJ01AB1234"
                vehicleType = "Tempo"
            },
            @{
                fullName = "Amit Sharma"
                phoneNumber = "+919876543231"
                password = "Test@123"
                email = "amit@quicktransport.com"
                vehicleNumber = "GJ01CD5678"
                vehicleType = "Truck"
            }
        )
    }
)

$createdUsers = @()

foreach ($roleGroup in $testUsers) {
    $role = $roleGroup.role
    Write-Host "Creating $role users..." -ForegroundColor Yellow
    Write-Host ""
    
    foreach ($user in $roleGroup.users) {
        Write-Host "  Creating: $($user.fullName) ($($user.phoneNumber))" -ForegroundColor Cyan
        
        $body = @{
            phoneNumber = $user.phoneNumber
            password = $user.password
            fullName = $user.fullName
            email = $user.email
            role = $role
        } | ConvertTo-Json
        
        try {
            $response = Invoke-RestMethod -Uri "$IdentityApiUrl/api/auth/register" `
                -Method POST `
                -ContentType "application/json" `
                -Body $body
            
            Write-Host "    ✓ Created successfully!" -ForegroundColor Green
            
            # Try to login and get token
            $loginBody = @{
                phoneNumber = $user.phoneNumber
                password = $user.password
            } | ConvertTo-Json
            
            $loginResponse = Invoke-RestMethod -Uri "$IdentityApiUrl/api/auth/login" `
                -Method POST `
                -ContentType "application/json" `
                -Body $loginBody
            
            $createdUsers += @{
                role = $role
                user = $user
                userId = $response.userId
                token = $loginResponse.token
            }
            
            Write-Host "    Token: $($loginResponse.token.Substring(0, 20))..." -ForegroundColor Gray
            Write-Host ""
            
        } catch {
            Write-Host "    ✗ Failed: $($_.Exception.Message)" -ForegroundColor Red
            Write-Host ""
        }
        
        Start-Sleep -Seconds 1
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "User Creation Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$summary = @{
    buyers = @()
    vendors = @()
    transporters = @()
}

foreach ($created in $createdUsers) {
    switch ($created.role) {
        "Buyer" { $summary.buyers += $created }
        "Vendor" { $summary.vendors += $created }
        "Transporter" { $summary.transporters += $created }
    }
}

Write-Host "Buyers Created: $($summary.buyers.Count)" -ForegroundColor Green
foreach ($buyer in $summary.buyers) {
    Write-Host "  - $($buyer.user.fullName) | $($buyer.user.phoneNumber)" -ForegroundColor White
}
Write-Host ""

Write-Host "Vendors Created: $($summary.vendors.Count)" -ForegroundColor Green
foreach ($vendor in $summary.vendors) {
    Write-Host "  - $($vendor.user.fullName) | $($vendor.user.phoneNumber)" -ForegroundColor White
}
Write-Host ""

Write-Host "Transporters Created: $($summary.transporters.Count)" -ForegroundColor Green
foreach ($transporter in $summary.transporters) {
    Write-Host "  - $($transporter.user.fullName) | $($transporter.user.phoneNumber)" -ForegroundColor White
}
Write-Host ""

# Save credentials to file for testing
$credentials = @{
    apiUrl = $IdentityApiUrl
    created = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    users = $createdUsers
} | ConvertTo-Json -Depth 10

$credentials | Out-File -FilePath "test-users-credentials.json" -Encoding UTF8

Write-Host "✓ Credentials saved to: test-users-credentials.json" -ForegroundColor Green
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Test Credentials" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "All passwords: Test@123" -ForegroundColor Yellow
Write-Host ""
Write-Host "Login Examples:" -ForegroundColor Cyan
Write-Host "  Buyer: +919876543210 / Test@123" -ForegroundColor White
Write-Host "  Vendor: +919876543220 / Test@123" -ForegroundColor White
Write-Host "  Transporter: +919876543230 / Test@123" -ForegroundColor White
Write-Host ""

Write-Host "[SUCCESS] Test users created!" -ForegroundColor Green
Write-Host "You can now test the app with real user data." -ForegroundColor White
Write-Host ""
