# Step-by-Step Azure Deployment (Avoiding Throttling)
# Run each step one at a time with 2-minute breaks

$ResourceGroup = "mandiapp-rg"
$Location = "centralindia"
$AppServicePlan = "mandiapp-plan"
$PostgresServer = "mandiapp-db-4674"
$DbAdminUser = "mandiadmin"
$DbPassword = "Myerp@2026"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Step-by-Step Azure Deployment" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Choose a step to run:" -ForegroundColor Yellow
Write-Host "  1. Create App Service Plan" -ForegroundColor White
Write-Host "  2. Create Identity API Web App" -ForegroundColor White
Write-Host "  3. Create Marketplace API Web App" -ForegroundColor White
Write-Host "  4. Create Ordering API Web App" -ForegroundColor White
Write-Host "  5. Create Logistics Hub Web App" -ForegroundColor White
Write-Host "  6. Show all resources" -ForegroundColor White
Write-Host ""

$step = Read-Host "Enter step number (1-6)"

switch ($step) {
    "1" {
        Write-Host ""
        Write-Host "Creating App Service Plan..." -ForegroundColor Yellow
        az appservice plan create `
            --resource-group $ResourceGroup `
            --name $AppServicePlan `
            --location $Location `
            --is-linux `
            --sku B1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host ""
            Write-Host "[SUCCESS] App Service Plan created!" -ForegroundColor Green
            Write-Host "Wait 2 minutes, then run step 2" -ForegroundColor Yellow
        }
    }
    
    "2" {
        Write-Host ""
        Write-Host "Creating Identity API Web App..." -ForegroundColor Yellow
        $appName = "mandiapp-2026-identity-api"
        
        az webapp create `
            --resource-group $ResourceGroup `
            --plan $AppServicePlan `
            --name $appName `
            --runtime "DOTNETCORE:8.0"
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host ""
            Write-Host "[SUCCESS] Identity API created at: https://${appName}.azurewebsites.net" -ForegroundColor Green
            
            # Configure
            $connStr = "Host=${PostgresServer}.postgres.database.azure.com;Port=5432;Username=${DbAdminUser};Password=${DbPassword};Database=MandiIdentityDB;SSL Mode=Require"
            
            az webapp config appsettings set `
                --resource-group $ResourceGroup `
                --name $appName `
                --settings `
                    ASPNETCORE_ENVIRONMENT=Production `
                    "ConnectionStrings__DefaultConnection=$connStr"
            
            Write-Host ""
            Write-Host "Wait 2 minutes, then run step 3" -ForegroundColor Yellow
        }
    }
    
    "3" {
        Write-Host ""
        Write-Host "Creating Marketplace API Web App..." -ForegroundColor Yellow
        $appName = "mandiapp-2026-marketplace-api"
        
        az webapp create `
            --resource-group $ResourceGroup `
            --plan $AppServicePlan `
            --name $appName `
            --runtime "DOTNETCORE:8.0"
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host ""
            Write-Host "[SUCCESS] Marketplace API created at: https://${appName}.azurewebsites.net" -ForegroundColor Green
            
            # Configure
            $connStr = "Host=${PostgresServer}.postgres.database.azure.com;Port=5432;Username=${DbAdminUser};Password=${DbPassword};Database=MandiMarketplaceDB;SSL Mode=Require"
            
            az webapp config appsettings set `
                --resource-group $ResourceGroup `
                --name $appName `
                --settings `
                    ASPNETCORE_ENVIRONMENT=Production `
                    "ConnectionStrings__DefaultConnection=$connStr"
            
            Write-Host ""
            Write-Host "Wait 2 minutes, then run step 4" -ForegroundColor Yellow
        }
    }
    
    "4" {
        Write-Host ""
        Write-Host "Creating Ordering API Web App..." -ForegroundColor Yellow
        $appName = "mandiapp-2026-ordering-api"
        
        az webapp create `
            --resource-group $ResourceGroup `
            --plan $AppServicePlan `
            --name $appName `
            --runtime "DOTNETCORE:8.0"
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host ""
            Write-Host "[SUCCESS] Ordering API created at: https://${appName}.azurewebsites.net" -ForegroundColor Green
            
            # Configure
            $connStr = "Host=${PostgresServer}.postgres.database.azure.com;Port=5432;Username=${DbAdminUser};Password=${DbPassword};Database=MandiOrderingDB;SSL Mode=Require"
            
            az webapp config appsettings set `
                --resource-group $ResourceGroup `
                --name $appName `
                --settings `
                    ASPNETCORE_ENVIRONMENT=Production `
                    "ConnectionStrings__DefaultConnection=$connStr"
            
            Write-Host ""
            Write-Host "Wait 2 minutes, then run step 5" -ForegroundColor Yellow
        }
    }
    
    "5" {
        Write-Host ""
        Write-Host "Creating Logistics Hub Web App..." -ForegroundColor Yellow
        $appName = "mandiapp-2026-logistics-hub"
        
        az webapp create `
            --resource-group $ResourceGroup `
            --plan $AppServicePlan `
            --name $appName `
            --runtime "DOTNETCORE:8.0"
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host ""
            Write-Host "[SUCCESS] Logistics Hub created at: https://${appName}.azurewebsites.net" -ForegroundColor Green
            
            # Configure
            $connStr = "Host=${PostgresServer}.postgres.database.azure.com;Port=5432;Username=${DbAdminUser};Password=${DbPassword};Database=MandiLogisticsDB;SSL Mode=Require"
            
            az webapp config appsettings set `
                --resource-group $ResourceGroup `
                --name $appName `
                --settings `
                    ASPNETCORE_ENVIRONMENT=Production `
                    "ConnectionStrings__DefaultConnection=$connStr"
            
            Write-Host ""
            Write-Host "[SUCCESS] All web apps created!" -ForegroundColor Green
            Write-Host ""
            Write-Host "Your APIs:" -ForegroundColor Cyan
            Write-Host "  https://mandiapp-2026-identity-api.azurewebsites.net" -ForegroundColor White
            Write-Host "  https://mandiapp-2026-marketplace-api.azurewebsites.net" -ForegroundColor White
            Write-Host "  https://mandiapp-2026-ordering-api.azurewebsites.net" -ForegroundColor White
            Write-Host "  https://mandiapp-2026-logistics-hub.azurewebsites.net" -ForegroundColor White
        }
    }
    
    "6" {
        Write-Host ""
        Write-Host "All Resources:" -ForegroundColor Cyan
        az resource list --resource-group $ResourceGroup --output table
    }
}
