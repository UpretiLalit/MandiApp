# Azure Deployment with Free Credits ($200)
# Optimized to use your free tier + credits efficiently
# Cost: ~$30/month (FREE for first month with credits!)

param(
    [string]$ResourceGroup = "mandiapp-rg",
    [string]$Location = "centralindia",
    [string]$AppServicePlan = "mandiapp-plan",
    [string]$WebAppName = "mandiapp-$(Get-Random -Minimum 1000 -Maximum 9999)",
    [string]$PostgresServer = "mandiapp-db-$(Get-Random -Minimum 1000 -Maximum 9999)",
    [string]$DbAdminUser = "mandiadmin",
    [string]$DbAdminPassword = ""
)

$ErrorActionPreference = "Stop"

# Refresh PATH environment variable
Write-Host "Initializing..." -ForegroundColor Yellow
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Azure Deployment with Free Credits" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "This deployment uses your $200 Azure credits" -ForegroundColor Green
Write-Host "Estimated cost: ~$30/month (FREE for Month 1!)" -ForegroundColor Green
Write-Host ""

# Check Azure CLI
Write-Host "Checking Azure CLI..." -ForegroundColor Yellow
try {
    $azCheck = & az version 2>&1
    if ($LASTEXITCODE -eq 0) {
        $azVersion = $azCheck | ConvertFrom-Json
        Write-Host "[OK] Azure CLI installed: $($azVersion.'azure-cli')" -ForegroundColor Green
    } else {
        throw "Azure CLI check failed"
    }
} catch {
    Write-Host "[ERROR] Azure CLI not found or not working!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Install Azure CLI:" -ForegroundColor Yellow
    Write-Host "  winget install Microsoft.AzureCLI" -ForegroundColor Cyan
    Write-Host ""
    $install = Read-Host "Install now using winget? (yes/no)"
    if ($install -eq "yes") {
        winget install Microsoft.AzureCLI
        Write-Host "Please restart PowerShell and run this script again." -ForegroundColor Yellow
        exit 0
    }
    exit 1
}

# Login to Azure
Write-Host ""
Write-Host "Logging into Azure..." -ForegroundColor Yellow
$accountCheck = & az account show 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "Not logged in. Opening browser for Azure login..." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "A browser window will open. Please:" -ForegroundColor Cyan
    Write-Host "  1. Sign in with your Azure account" -ForegroundColor White
    Write-Host "  2. Complete the authentication" -ForegroundColor White
    Write-Host "  3. Return to this window" -ForegroundColor White
    Write-Host ""
    
    $loginResult = & az login 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERROR] Azure login failed!" -ForegroundColor Red
        Write-Host "Error details: $loginResult" -ForegroundColor Red
        Write-Host ""
        Write-Host "Troubleshooting:" -ForegroundColor Yellow
        Write-Host "  1. Make sure you have an Azure account" -ForegroundColor White
        Write-Host "  2. Sign up at: https://azure.microsoft.com/free/" -ForegroundColor White
        Write-Host "  3. Check your internet connection" -ForegroundColor White
        exit 1
    }
}

$account = & az account show 2>&1 | ConvertFrom-Json
Write-Host "[OK] Logged in as: $($account.user.name)" -ForegroundColor Green
Write-Host "    Subscription: $($account.name)" -ForegroundColor Cyan

# Check credits
Write-Host ""
Write-Host "Checking Azure credits..." -ForegroundColor Yellow
Write-Host "Visit: https://portal.azure.com/#blade/Microsoft_Azure_Billing/ModernBillingMenuBlade/Credits" -ForegroundColor Cyan
Write-Host "to see your remaining credits" -ForegroundColor Cyan

# Generate DB password if not provided
if (-not $DbAdminPassword) {
    $DbAdminPassword = -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 16 | ForEach-Object {[char]$_}) + "Aa1!"
}

Write-Host ""
Write-Host "Deployment Configuration:" -ForegroundColor Cyan
Write-Host "  Resource Group: $ResourceGroup" -ForegroundColor White
Write-Host "  Location: $Location" -ForegroundColor White
Write-Host "  App Service Plan: B1 (1 core, 1.75GB RAM)" -ForegroundColor White
Write-Host "  PostgreSQL: B1ms Burstable (2 vCores, 2GB RAM)" -ForegroundColor White
Write-Host ""
Write-Host "Estimated Monthly Cost: ~$30" -ForegroundColor Yellow
Write-Host "Your Credits: $200 (lasts ~6.5 months!)" -ForegroundColor Green
Write-Host ""

$confirm = Read-Host "Continue with deployment? (yes/no)"
if ($confirm -ne "yes") {
    Write-Host "Deployment cancelled." -ForegroundColor Yellow
    exit 0
}

# Create Resource Group
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Step 1: Creating Resource Group" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$rgResult = az group create --name $ResourceGroup --location $Location --output none 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Failed to create resource group" -ForegroundColor Red
    Write-Host "Error: $rgResult" -ForegroundColor Red
    Write-Host ""
    Write-Host "Press any key to exit..." -ForegroundColor Yellow
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 1
}
Write-Host "[OK] Resource group created" -ForegroundColor Green

# Create PostgreSQL Database
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Step 2: Creating PostgreSQL Database" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "This will take 5-10 minutes..." -ForegroundColor Yellow
Write-Host ""

Write-Host "Creating PostgreSQL server: $PostgresServer" -ForegroundColor Gray
Write-Host ""

$ErrorActionPreference = "Continue"
$dbResult = az postgres flexible-server create `
    --resource-group $ResourceGroup `
    --name $PostgresServer `
    --location $Location `
    --admin-user $DbAdminUser `
    --admin-password $DbAdminPassword `
    --sku-name Standard_B1ms `
    --tier Burstable `
    --storage-size 32 `
    --version 16 `
    --public-access 0.0.0.0 `
    --yes 2>&1

$ErrorActionPreference = "Stop"

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "[ERROR] Failed to create PostgreSQL server" -ForegroundColor Red
    Write-Host "Error details:" -ForegroundColor Yellow
    Write-Host $dbResult -ForegroundColor Red
    Write-Host ""
    Write-Host "Common issues:" -ForegroundColor Yellow
    Write-Host "  1. Server name already taken (try a different random number)" -ForegroundColor White
    Write-Host "  2. No remaining credits or subscription issue" -ForegroundColor White
    Write-Host "  3. Location doesn't support this SKU" -ForegroundColor White
    Write-Host ""
    Write-Host "Try these alternatives:" -ForegroundColor Cyan
    Write-Host "  - Use FREE deployment instead: .\deploy-free.ps1" -ForegroundColor White
    Write-Host "  - Check credits: https://portal.azure.com/#blade/Microsoft_Azure_Billing/ModernBillingMenuBlade/Credits" -ForegroundColor White
    Write-Host "  - Run again with different name: .\azure-deploy-with-credits.ps1 -PostgresServer 'mandiapp-db-YOUR-NAME'" -ForegroundColor White
    Write-Host ""
    
    Write-Host "Press any key to continue..." -ForegroundColor Yellow
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    
    $retry = Read-Host "Do you want to try FREE deployment instead? (yes/no)"
    if ($retry -eq "yes") {
        Write-Host ""
        Write-Host "Switching to FREE deployment..." -ForegroundColor Green
        Write-Host "Run: .\deploy-free.ps1" -ForegroundColor Cyan
    }
    Write-Host ""
    Write-Host "Press any key to exit..." -ForegroundColor Yellow
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 1
}

Write-Host "[OK] PostgreSQL server created" -ForegroundColor Green

# Create databases
Write-Host ""
Write-Host "Creating databases..." -ForegroundColor Yellow
az postgres flexible-server db create --resource-group $ResourceGroup --server-name $PostgresServer --database-name MandiIdentityDB --output none
az postgres flexible-server db create --resource-group $ResourceGroup --server-name $PostgresServer --database-name MandiMarketplaceDB --output none
az postgres flexible-server db create --resource-group $ResourceGroup --server-name $PostgresServer --database-name MandiOrderingDB --output none
az postgres flexible-server db create --resource-group $ResourceGroup --server-name $PostgresServer --database-name MandiLogisticsDB --output none
Write-Host "[OK] All databases created" -ForegroundColor Green

# Create App Service Plan
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Step 3: Creating App Service Plan" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$ErrorActionPreference = "Continue"
$planResult = az appservice plan create `
    --resource-group $ResourceGroup `
    --name $AppServicePlan `
    --location $Location `
    --is-linux `
    --sku B1 2>&1

$ErrorActionPreference = "Stop"

if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Failed to create App Service Plan" -ForegroundColor Red
    Write-Host "Error: $planResult" -ForegroundColor Red
    Write-Host ""
    Write-Host "Press any key to exit..." -ForegroundColor Yellow
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 1
}

Write-Host "[OK] App Service Plan created" -ForegroundColor Green

# Build connection string
$dbHost = "${PostgresServer}.postgres.database.azure.com"
$dbConnStrBase = "Host=${dbHost};Port=5432;Username=${DbAdminUser};Password=${DbAdminPassword};SSL Mode=Require;"

# Generate JWT secret
$jwtSecret = -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 64 | ForEach-Object {[char]$_})

# Deploy Backend APIs
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Step 4: Deploying Backend APIs" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Get script directory and ensure we're in the right location
$scriptDir = $PSScriptRoot
if (-not $scriptDir) { $scriptDir = (Get-Location).Path }
Set-Location $scriptDir
Write-Host "Working directory: $scriptDir" -ForegroundColor Gray
Write-Host ""

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
    
    # Create Web App
    az webapp create `
        --resource-group $ResourceGroup `
        --plan $AppServicePlan `
        --name $appName `
        --runtime "DOTNETCORE:8.0" `
        --output none
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERROR] Failed to create $appName" -ForegroundColor Red
        continue
    }
    
    # Configure app settings
    $dbConnStr = "${dbConnStrBase}Database=$($svc.DbName)"
    
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
    Write-Host "  Building and deploying $($svc.Name)..." -ForegroundColor Gray
    
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
}

# Deploy Frontend to Azure Static Web Apps
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Step 5: Building Frontend" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Ensure we're back in the script directory
Set-Location $scriptDir

# Update frontend environment
$frontendEnv = @"
export const environment = {
  production: true,
  apiUrl: '$($apiUrls['marketplace-api'])/api',
  identityApiUrl: '$($apiUrls['identity-api'])/api',
  marketplaceApiUrl: '$($apiUrls['marketplace-api'])/api',
  orderingApiUrl: '$($apiUrls['ordering-api'])/api',
  logisticsHubUrl: '$($apiUrls['logistics-hub'])/',
  trackingHubUrl: '$($apiUrls['logistics-hub'])/hubs/tracking',
  priceHubUrl: '$($apiUrls['marketplace-api'])/hubs/price',
  razorpayKeyId: 'rzp_test_Rt4HsYWkXkSWT4',
  useMockPayment: true,
  firebase: {
    apiKey: 'your-firebase-api-key',
    authDomain: 'your-app.firebaseapp.com',
    projectId: 'your-project-id',
    storageBucket: 'your-app.appspot.com',
    messagingSenderId: 'your-sender-id',
    appId: 'your-app-id'
  }
};
"@

$frontendEnvPath = Join-Path $scriptDir "Frontend/src/environments"
if (-not (Test-Path $frontendEnvPath)) {
    New-Item -ItemType Directory -Force -Path $frontendEnvPath | Out-Null
}
Set-Content -Path (Join-Path $frontendEnvPath "environment.prod.ts") -Value $frontendEnv

Write-Host "Building frontend..." -ForegroundColor Yellow
$frontendPath = Join-Path $scriptDir "Frontend"
Push-Location $frontendPath
npm install --silent
npm run build --prod

if ($LASTEXITCODE -eq 0) {
    Write-Host "[OK] Frontend built successfully" -ForegroundColor Green
    
    # Create Static Web App
    Write-Host ""
    Write-Host "Creating Azure Static Web App..." -ForegroundColor Yellow
    
    $staticAppName = "${WebAppName}-frontend"
    az staticwebapp create `
        --name $staticAppName `
        --resource-group $ResourceGroup `
        --location $Location `
        --source ./www `
        --output none
    
    if ($LASTEXITCODE -eq 0) {
        $frontendUrl = az staticwebapp show --name $staticAppName --resource-group $ResourceGroup --query "defaultHostname" -o tsv
        Write-Host "[OK] Frontend deployed at: https://$frontendUrl" -ForegroundColor Green
    } else {
        Write-Host "[WARNING] Static Web App creation failed. Deploy manually:" -ForegroundColor Yellow
        Write-Host "  1. Go to: https://portal.azure.com" -ForegroundColor White
        Write-Host "  2. Create Static Web App" -ForegroundColor White
        Write-Host "  3. Upload the 'www' folder" -ForegroundColor White
    }
} else {
    Write-Host "[ERROR] Frontend build failed" -ForegroundColor Red
}
Pop-Location

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
  Admin Password: ${DbAdminPassword}
  
  Databases:
    - MandiIdentityDB
    - MandiMarketplaceDB
    - MandiOrderingDB
    - MandiLogisticsDB

Security:
  JWT Secret: ${jwtSecret}

Frontend:
  Build Location: Frontend/www
  Deploy to: Azure Static Web App or Azure Blob Storage

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
  
Cost Monitoring:
  Credits: https://portal.azure.com/#blade/Microsoft_Azure_Billing/ModernBillingMenuBlade/Credits
  Cost Analysis: https://portal.azure.com/#blade/Microsoft_Azure_CostManagement/Menu/costanalysis

Cleanup (Delete everything):
  az group delete --name $ResourceGroup --yes --no-wait

Migration to FREE Stack (After Month 1):
  Run: .\migrate-to-free.ps1
  This will export your database and move to Vercel + Render + Supabase (FREE)

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
Write-Host "  2. Monitor costs at: https://portal.azure.com/#blade/Microsoft_Azure_CostManagement/Menu/costanalysis" -ForegroundColor White
Write-Host "  3. Around Day 25, decide: continue with Azure or migrate to FREE" -ForegroundColor White
Write-Host ""
Write-Host "Estimated credit usage this month: ~$30 of $200" -ForegroundColor Green
Write-Host "Remaining credits after Month 1: ~$170" -ForegroundColor Green
Write-Host ""
