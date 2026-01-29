# Continue Azure Deployment (After Throttle Wait)
# Run this after waiting 10 minutes

$ErrorActionPreference = "Stop"

# Existing resources
$ResourceGroup = "mandiapp-rg"
$Location = "centralindia"
$AppServicePlan = "mandiapp-plan"
$PostgresServer = "mandiapp-db-4674"
$DbAdminUser = "mandiadmin"
$WebAppName = "mandiapp-$(Get-Random -Minimum 1000 -Maximum 9999)"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Continue Azure Deployment" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Existing resources:" -ForegroundColor Green
Write-Host "  PostgreSQL Server: $PostgresServer" -ForegroundColor White
Write-Host "  Resource Group: $ResourceGroup" -ForegroundColor White
Write-Host ""

# Ask for database password (plain text)
Write-Host "IMPORTANT: You need the PostgreSQL password that was auto-generated." -ForegroundColor Yellow
Write-Host "If you don't have it, check your previous terminal output or reset it in Azure Portal." -ForegroundColor Yellow
Write-Host ""
$DbAdminPasswordPlain = Read-Host "Enter PostgreSQL admin password"

if (-not $DbAdminPasswordPlain) {
    Write-Host "[ERROR] Password is required!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Creating App Service Plan..." -ForegroundColor Yellow

# Step 3: Create App Service Plan
$ErrorActionPreference = "Continue"
$planResult = az appservice plan create `
    --resource-group $ResourceGroup `
    --name $AppServicePlan `
    --location $Location `
    --is-linux `
    --sku B1 2>&1

$ErrorActionPreference = "Stop"

if ($LASTEXITCODE -ne 0) {
    if ($planResult -match "throttled") {
        Write-Host "[ERROR] Still throttled. Wait another 5 minutes." -ForegroundColor Red
        exit 1
    } elseif ($planResult -match "already exists") {
        Write-Host "[OK] App Service Plan already exists" -ForegroundColor Green
    } else {
        Write-Host "[ERROR] Failed to create App Service Plan" -ForegroundColor Red
        Write-Host "Error: $planResult" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "[OK] App Service Plan created" -ForegroundColor Green
}

# Build connection string
$dbHost = "${PostgresServer}.postgres.database.azure.com"
$dbConnStrBase = "Host=${dbHost};Port=5432;Username=${DbAdminUser};Password=${DbAdminPasswordPlain};SSL Mode=Require;"

# Generate JWT secret
$jwtSecret = -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 64 | ForEach-Object {[char]$_})

# Deploy Backend APIs
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Step 4: Deploying Backend APIs" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$scriptDir = $PSScriptRoot
if (-not $scriptDir) { $scriptDir = (Get-Location).Path }
Set-Location $scriptDir

$services = @(
    @{Name="identity-api"; Path="Backend/Services/Identity.API"; DbName="MandiIdentityDB"},
    @{Name="marketplace-api"; Path="Backend/Services/Marketplace.API"; DbName="MandiMarketplaceDB"},
    @{Name="ordering-api"; Path="Backend/Services/Ordering.API"; DbName="MandiOrderingDB"},
    @{Name="logistics-hub"; Path="Backend/Services/Logistics.Hub"; DbName="MandiLogisticsDB"}
)

$apiUrls = @{}

foreach ($svc in $services) {
    $appName = "${WebAppName}-$($svc.Name)"
    Write-Host "Deploying $($svc.Name)..." -ForegroundColor Yellow
    
    # Create Web App (with 30 second wait between each to avoid throttling)
    Write-Host "  Creating web app..." -ForegroundColor Gray
    $ErrorActionPreference = "Continue"
    az webapp create `
        --resource-group $ResourceGroup `
        --plan $AppServicePlan `
        --name $appName `
        --runtime "DOTNETCORE:8.0" `
        --output none 2>&1 | Out-Null
    
    $ErrorActionPreference = "Stop"
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERROR] Failed to create $appName" -ForegroundColor Red
        continue
    }
    
    Write-Host "  Waiting 30 seconds to avoid throttling..." -ForegroundColor Gray
    Start-Sleep -Seconds 30
    
    # Configure app settings
    $dbConnStr = "${dbConnStrBase}Database=$($svc.DbName)"
    
    Write-Host "  Configuring settings..." -ForegroundColor Gray
    az webapp config appsettings set `
        --resource-group $ResourceGroup `
        --name $appName `
        --settings `
            ConnectionStrings__DefaultConnection="$dbConnStr" `
            ASPNETCORE_ENVIRONMENT=Production `
            JWT__Secret="$jwtSecret" `
            JWT__Issuer="https://${appName}.azurewebsites.net" `
            JWT__Audience="https://${appName}.azurewebsites.net" `
        --output none
    
    # Enable logging
    az webapp log config `
        --resource-group $ResourceGroup `
        --name $appName `
        --application-logging filesystem `
        --detailed-error-messages true `
        --output none
    
    # Deploy code using ZIP
    Write-Host "  Building and deploying code..." -ForegroundColor Gray
    
    $servicePath = Join-Path $scriptDir $svc.Path
    if (-not (Test-Path $servicePath)) {
        Write-Host "[ERROR] Service path not found: $servicePath" -ForegroundColor Red
        continue
    }
    
    Push-Location $servicePath
    dotnet publish -c Release -o ./publish
    if ($LASTEXITCODE -eq 0) {
        Compress-Archive -Path ./publish/* -DestinationPath deploy.zip -Force
        az webapp deployment source config-zip `
            --resource-group $ResourceGroup `
            --name $appName `
            --src deploy.zip `
            --output none
        Remove-Item deploy.zip
        Remove-Item -Recurse ./publish
    }
    Pop-Location
    
    $appUrl = "https://${appName}.azurewebsites.net"
    $apiUrls[$svc.Name] = $appUrl
    
    Write-Host "[OK] $($svc.Name) deployed at: $appUrl" -ForegroundColor Green
    Write-Host ""
}

# Save credentials
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Deployment Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

$credsContent = @"
Azure Deployment Credentials
=============================

Deployment Date: $(Get-Date)
Resource Group: $ResourceGroup
Location: $Location

Backend APIs:
  Identity API:     $($apiUrls['identity-api'])
  Marketplace API:  $($apiUrls['marketplace-api'])
  Ordering API:     $($apiUrls['ordering-api'])
  Logistics Hub:    $($apiUrls['logistics-hub'])

Database:
  Server: ${dbHost}
  Port: 5432
  Admin User: ${DbAdminUser}
  Admin Password: ${DbAdminPasswordPlain}
  
  Databases:
    - MandiIdentityDB
    - MandiMarketplaceDB
    - MandiOrderingDB
    - MandiLogisticsDB

Security:
  JWT Secret: ${jwtSecret}

Estimated Monthly Cost: ~$30
  - App Service Plan B1: ~$13/month
  - PostgreSQL Flexible B1ms: ~$12/month
  - Static Web App: FREE
  - Bandwidth: ~$2-5/month

Your $200 credits will last approximately 6.5 months!

Management:
  Portal: https://portal.azure.com
  View Resources: az resource list --resource-group $ResourceGroup --output table
  View Logs: az webapp log tail --resource-group $ResourceGroup --name <app-name>

Cleanup (Delete everything):
  az group delete --name $ResourceGroup --yes --no-wait

"@

$credsFile = "azure-deployment-credentials.txt"
Set-Content -Path $credsFile -Value $credsContent

Write-Host "Credentials saved to: $credsFile" -ForegroundColor Green
Write-Host ""
Write-Host "Your APIs are live at:" -ForegroundColor Cyan
foreach ($svc in $services) {
    Write-Host "  $($svc.Name): $($apiUrls[$svc.Name])" -ForegroundColor White
}
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Test your APIs: curl $($apiUrls['identity-api'])/health" -ForegroundColor White
Write-Host "  2. Monitor costs at: https://portal.azure.com" -ForegroundColor White
Write-Host ""
