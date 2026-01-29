# Migrate from Azure to FREE Stack (Vercel + Render + Supabase)
# Run this around Day 25 to avoid charges in Month 2

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Migrate Azure → FREE Stack" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "This will help you migrate from Azure to:" -ForegroundColor Yellow
Write-Host "  - Supabase (FREE PostgreSQL)" -ForegroundColor White
Write-Host "  - Render.com (FREE Backend APIs)" -ForegroundColor White
Write-Host "  - Vercel (FREE Frontend)" -ForegroundColor White
Write-Host ""
Write-Host "Total cost after migration: $0/month!" -ForegroundColor Green
Write-Host ""

$confirm = Read-Host "Continue with migration? (yes/no)"
if ($confirm -ne "yes") {
    Write-Host "Migration cancelled." -ForegroundColor Yellow
    exit 0
}

# Read Azure credentials
if (-not (Test-Path "azure-deployment-credentials.txt")) {
    Write-Host "[ERROR] Azure credentials file not found!" -ForegroundColor Red
    Write-Host "Make sure you've deployed to Azure first." -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Step 1: Backup Azure Database" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Extract database info from credentials file
$creds = Get-Content "azure-deployment-credentials.txt" -Raw
if ($creds -match "Server: ([^\r\n]+)") { $dbHost = $matches[1] }
if ($creds -match "Admin User: ([^\r\n]+)") { $dbUser = $matches[1] }
if ($creds -match "Admin Password: ([^\r\n]+)") { $dbPassword = $matches[1] }

Write-Host "Creating database backup..." -ForegroundColor Yellow
Write-Host ""
Write-Host "To backup your Azure database, run these commands:" -ForegroundColor Cyan
Write-Host ""
Write-Host "# Install PostgreSQL client if needed" -ForegroundColor Gray
Write-Host "winget install PostgreSQL.PostgreSQL" -ForegroundColor White
Write-Host ""
Write-Host "# Backup each database" -ForegroundColor Gray
Write-Host "pg_dump `"host=$dbHost port=5432 dbname=MandiIdentityDB user=$dbUser password=$dbPassword sslmode=require`" > identity-backup.sql" -ForegroundColor White
Write-Host "pg_dump `"host=$dbHost port=5432 dbname=MandiMarketplaceDB user=$dbUser password=$dbPassword sslmode=require`" > marketplace-backup.sql" -ForegroundColor White
Write-Host "pg_dump `"host=$dbHost port=5432 dbname=MandiOrderingDB user=$dbUser password=$dbPassword sslmode=require`" > ordering-backup.sql" -ForegroundColor White
Write-Host "pg_dump `"host=$dbHost port=5432 dbname=MandiLogisticsDB user=$dbUser password=$dbPassword sslmode=require`" > logistics-backup.sql" -ForegroundColor White
Write-Host ""

$backed = Read-Host "Have you backed up the databases? (yes/no)"
if ($backed -ne "yes") {
    Write-Host "Please backup the databases first." -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Step 2: Setup Supabase Database" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Go to: https://supabase.com" -ForegroundColor Yellow
Write-Host "2. Sign in with GitHub" -ForegroundColor Yellow
Write-Host "3. Create new project: 'mandiapp'" -ForegroundColor Yellow
Write-Host "4. Copy the connection string from Settings > Database" -ForegroundColor Yellow
Write-Host ""

$supabaseUrl = Read-Host "Paste your Supabase connection string"

if (-not $supabaseUrl) {
    Write-Host "[ERROR] Supabase URL required!" -ForegroundColor Red
    exit 1
}

Write-Host "[OK] Supabase configured" -ForegroundColor Green

Write-Host ""
Write-Host "Now restore your backups to Supabase:" -ForegroundColor Yellow
Write-Host ""
Write-Host "psql `"$supabaseUrl`" < identity-backup.sql" -ForegroundColor White
Write-Host "psql `"$supabaseUrl`" < marketplace-backup.sql" -ForegroundColor White
Write-Host "psql `"$supabaseUrl`" < ordering-backup.sql" -ForegroundColor White
Write-Host "psql `"$supabaseUrl`" < logistics-backup.sql" -ForegroundColor White
Write-Host ""

$restored = Read-Host "Have you restored the databases? (yes/no)"
if ($restored -ne "yes") {
    Write-Host "Please restore the databases first." -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Step 3: Deploy to FREE Stack" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Now run the FREE deployment script:" -ForegroundColor Yellow
Write-Host ""
Write-Host ".\deploy-free.ps1" -ForegroundColor Cyan
Write-Host ""
Write-Host "When prompted for database URL, use your Supabase connection string." -ForegroundColor Yellow
Write-Host ""

$deployed = Read-Host "Have you completed the FREE deployment? (yes/no)"
if ($deployed -ne "yes") {
    Write-Host "Run deploy-free.ps1 first, then come back here." -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Step 4: Delete Azure Resources" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "IMPORTANT: Only do this after verifying the FREE deployment works!" -ForegroundColor Red
Write-Host ""
Write-Host "To delete all Azure resources and stop charges:" -ForegroundColor Yellow
Write-Host ""

if ($creds -match "Resource Group: ([^\r\n]+)") {
    $resourceGroup = $matches[1].Trim()
    Write-Host "az group delete --name $resourceGroup --yes --no-wait" -ForegroundColor Cyan
    Write-Host ""
    
    $delete = Read-Host "Delete Azure resources NOW? (yes/no)"
    if ($delete -eq "yes") {
        Write-Host ""
        Write-Host "Deleting Azure resources..." -ForegroundColor Yellow
        az group delete --name $resourceGroup --yes --no-wait
        Write-Host "[OK] Deletion started (will complete in 5-10 minutes)" -ForegroundColor Green
        Write-Host ""
        Write-Host "You will no longer be charged for Azure resources!" -ForegroundColor Green
    } else {
        Write-Host ""
        Write-Host "You can delete manually later:" -ForegroundColor Yellow
        Write-Host "  az group delete --name $resourceGroup --yes --no-wait" -ForegroundColor Cyan
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Migration Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Your app is now running on:" -ForegroundColor Cyan
Write-Host "  Database: Supabase (FREE)" -ForegroundColor White
Write-Host "  Backend: Render.com (FREE)" -ForegroundColor White
Write-Host "  Frontend: Vercel (FREE)" -ForegroundColor White
Write-Host ""
Write-Host "New monthly cost: $0!" -ForegroundColor Green
Write-Host "Azure credits saved: ~$170" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Test your new deployment thoroughly" -ForegroundColor White
Write-Host "  2. Update DNS to point to new URLs (if using custom domain)" -ForegroundColor White
Write-Host "  3. Monitor the FREE services for 24-48 hours" -ForegroundColor White
Write-Host "  4. Keep Azure backups for 7 days (just in case)" -ForegroundColor White
Write-Host ""
