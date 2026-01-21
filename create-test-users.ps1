# Test User Creation Helper Script
# This script provides commands to create test users via API

Write-Host "👥 MandiApp - Test User Creation Helper" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$identityApiUrl = "http://localhost:5003/api"

Write-Host "Make sure Identity.API is running at: $identityApiUrl" -ForegroundColor Yellow
Write-Host ""

# Test data
$testUsers = @(
    @{
        Name = "Buyer 1 (Restaurant)"
        PhoneNumber = "+919876543210"
        Role = "Buyer"
        FullName = "Rajesh Kumar"
        Email = "rajesh@hotelgrand.com"
        CompanyName = "Hotel Grand"
    },
    @{
        Name = "Buyer 2 (Hotel)"
        PhoneNumber = "+919876543211"
        Role = "Buyer"
        FullName = "Priya Shah"
        Email = "priya@restaurant.com"
        CompanyName = "Priya Restaurant"
    },
    @{
        Name = "Vendor 1 (Vegetables)"
        PhoneNumber = "+919876543220"
        Role = "Vendor"
        FullName = "Ramesh Patel"
        Email = "ramesh@freshveggies.com"
        BusinessName = "Fresh Veggies Co."
    },
    @{
        Name = "Vendor 2 (Vegetables)"
        PhoneNumber = "+919876543221"
        Role = "Vendor"
        FullName = "Suresh Mehta"
        Email = "suresh@greenvalley.com"
        BusinessName = "Green Valley Suppliers"
    },
    @{
        Name = "Vendor 3 (Fruits)"
        PhoneNumber = "+919876543222"
        Role = "Vendor"
        FullName = "Mahesh Kumar"
        Email = "mahesh@fruitking.com"
        BusinessName = "Fruit King"
    },
    @{
        Name = "Transporter 1"
        PhoneNumber = "+919876543230"
        Role = "Transporter"
        FullName = "Vijay Singh"
        Email = "vijay@delivery.com"
        VehicleNumber = "GJ01AB1234"
    },
    @{
        Name = "Transporter 2"
        PhoneNumber = "+919876543231"
        Role = "Transporter"
        FullName = "Rakesh Kumar"
        Email = "rakesh@logistics.com"
        VehicleNumber = "GJ01CD5678"
    }
)

Write-Host "Test Users to Create:" -ForegroundColor Green
Write-Host ""
foreach ($user in $testUsers) {
    Write-Host "  📱 $($user.Name)" -ForegroundColor Yellow
    Write-Host "     Phone: $($user.PhoneNumber)" -ForegroundColor White
    Write-Host "     Role: $($user.Role)" -ForegroundColor Cyan
    Write-Host ""
}

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "OPTION 1: Use Swagger UI (Recommended)" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Open: http://localhost:5003/swagger" -ForegroundColor Yellow
Write-Host "2. Find: POST /api/auth/register" -ForegroundColor Yellow
Write-Host "3. Use these JSON bodies:" -ForegroundColor Yellow
Write-Host ""

Write-Host "--- Buyer 1 ---" -ForegroundColor Magenta
$buyer1Json = @"
{
  "phoneNumber": "+919876543210",
  "password": "Test@123",
  "fullName": "Rajesh Kumar",
  "email": "rajesh@hotelgrand.com",
  "role": "Buyer"
}
"@
Write-Host $buyer1Json -ForegroundColor White
Write-Host ""

Write-Host "--- Vendor 1 ---" -ForegroundColor Magenta
$vendor1Json = @"
{
  "phoneNumber": "+919876543220",
  "password": "Test@123",
  "fullName": "Ramesh Patel",
  "email": "ramesh@freshveggies.com",
  "role": "Vendor"
}
"@
Write-Host $vendor1Json -ForegroundColor White
Write-Host ""

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "OPTION 2: Use PowerShell (Advanced)" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Copy and run these commands:" -ForegroundColor Yellow
Write-Host ""

foreach ($user in $testUsers) {
    $body = @{
        phoneNumber = $user.PhoneNumber
        password = "Test@123"
        fullName = $user.FullName
        email = $user.Email
        role = $user.Role
    }
    
    $jsonBody = $body | ConvertTo-Json
    
    Write-Host "# Create $($user.Name)" -ForegroundColor Cyan
    Write-Host @"
`$body = @'
$jsonBody
'@
Invoke-RestMethod -Uri '$identityApiUrl/auth/register' -Method Post -Body `$body -ContentType 'application/json'
"@ -ForegroundColor White
    Write-Host ""
}

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "AFTER CREATING USERS" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Note down the User IDs from responses" -ForegroundColor Yellow
Write-Host "2. Update seed-test-data.sql with actual User IDs" -ForegroundColor Yellow
Write-Host "3. Run the seed script to create profiles" -ForegroundColor Yellow
Write-Host ""

Write-Host "Test Login Credentials:" -ForegroundColor Cyan
Write-Host "  Phone: Any of the above numbers" -ForegroundColor White
Write-Host "  Password: Test@123" -ForegroundColor White
Write-Host "  OTP: 123456 (in test mode)" -ForegroundColor White
Write-Host ""

Write-Host "Press any key to create users automatically..." -ForegroundColor Yellow
$response = Read-Host "Continue? (y/n)"

if ($response -eq 'y' -or $response -eq 'Y') {
    Write-Host ""
    Write-Host "Creating users..." -ForegroundColor Green
    Write-Host ""
    
    $createdUsers = @()
    
    foreach ($user in $testUsers) {
        try {
            $body = @{
                phoneNumber = $user.PhoneNumber
                password = "Test@123"
                fullName = $user.FullName
                email = $user.Email
                role = $user.Role
            } | ConvertTo-Json
            
            Write-Host "Creating $($user.Name)..." -ForegroundColor Yellow
            
            $result = Invoke-RestMethod -Uri "$identityApiUrl/auth/register" -Method Post -Body $body -ContentType 'application/json'
            
            Write-Host "✓ Created: $($user.Name) - ID: $($result.userId)" -ForegroundColor Green
            
            $createdUsers += @{
                Name = $user.Name
                Phone = $user.PhoneNumber
                Role = $user.Role
                UserId = $result.userId
            }
            
            Start-Sleep -Seconds 1
        }
        catch {
            Write-Host "✗ Failed to create $($user.Name): $($_.Exception.Message)" -ForegroundColor Red
        }
    }
    
    Write-Host ""
    Write-Host "====================================" -ForegroundColor Cyan
    Write-Host "CREATED USERS SUMMARY" -ForegroundColor Green
    Write-Host "====================================" -ForegroundColor Cyan
    Write-Host ""
    
    foreach ($user in $createdUsers) {
        Write-Host "$($user.Role): $($user.Name)" -ForegroundColor Yellow
        Write-Host "  User ID: $($user.UserId)" -ForegroundColor Cyan
        Write-Host "  Phone: $($user.Phone)" -ForegroundColor White
        Write-Host ""
    }
    
    # Generate SQL for seed script
    Write-Host "====================================" -ForegroundColor Cyan
    Write-Host "SQL FOR seed-test-data.sql" -ForegroundColor Green
    Write-Host "====================================" -ForegroundColor Cyan
    Write-Host ""
    
    $buyers = $createdUsers | Where-Object { $_.Role -eq "Buyer" }
    $vendors = $createdUsers | Where-Object { $_.Role -eq "Vendor" }
    $transporters = $createdUsers | Where-Object { $_.Role -eq "Transporter" }
    
    if ($buyers.Count -gt 0) {
        Write-Host "-- Buyers" -ForegroundColor Cyan
        foreach ($buyer in $buyers) {
            $user = $testUsers | Where-Object { $_.PhoneNumber -eq $buyer.Phone }
            Write-Host @"
INSERT INTO buyers ("Id", "FullName", "PhoneNumber", "Email", "CompanyName", "BusinessAddress", "DeliveryAddress", "IsVerified")
VALUES ('$($buyer.UserId)', '$($user.FullName)', '$($user.PhoneNumber)', '$($user.Email)', '$($user.CompanyName)', 'Test Address', 'Test Address', true);
"@ -ForegroundColor White
        }
        Write-Host ""
    }
    
    if ($vendors.Count -gt 0) {
        Write-Host "-- Vendors" -ForegroundColor Cyan
        foreach ($vendor in $vendors) {
            $user = $testUsers | Where-Object { $_.PhoneNumber -eq $vendor.Phone }
            Write-Host @"
INSERT INTO vendors ("Id", "FullName", "PhoneNumber", "Email", "BusinessName", "BusinessAddress", "IsVerified", "IsActive")
VALUES ('$($vendor.UserId)', '$($user.FullName)', '$($user.PhoneNumber)', '$($user.Email)', '$($user.BusinessName)', 'Test Market', true, true);
"@ -ForegroundColor White
        }
        Write-Host ""
    }
    
    if ($transporters.Count -gt 0) {
        Write-Host "-- Transporters" -ForegroundColor Cyan
        foreach ($transporter in $transporters) {
            $user = $testUsers | Where-Object { $_.PhoneNumber -eq $transporter.Phone }
            Write-Host @"
INSERT INTO transporters ("Id", "FullName", "PhoneNumber", "VehicleNumber", "VehicleType", "IsVerified", "IsAvailable")
VALUES ('$($transporter.UserId)', '$($user.FullName)', '$($user.PhoneNumber)', '$($user.VehicleNumber)', 2, true, true);
"@ -ForegroundColor White
        }
    }
    
    Write-Host ""
    Write-Host "✅ Copy the SQL above and run it in your database!" -ForegroundColor Green
    Write-Host ""
}
else {
    Write-Host "Skipped automatic creation. Use Swagger UI instead." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Done! 🎉" -ForegroundColor Green
