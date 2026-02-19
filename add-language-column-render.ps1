# Add Language column to AspNetUsers table in Render PostgreSQL
# You need to get the connection details from Render Dashboard

Write-Host "Get your Render PostgreSQL connection details:" -ForegroundColor Cyan
Write-Host "1. Go to https://dashboard.render.com" -ForegroundColor Yellow
Write-Host "2. Click on 'mandiapp-db' database" -ForegroundColor Yellow
Write-Host "3. Click 'Connect' -> 'External Connection'" -ForegroundColor Yellow
Write-Host "4. Copy the 'PSQL Command'" -ForegroundColor Yellow
Write-Host ""
Write-Host "It should look like:" -ForegroundColor Gray
Write-Host "PGPASSWORD=xxxxx psql -h dpg-xxxxx.oregon-postgres.render.com -U mandiapp_db_user mandiapp_db" -ForegroundColor Gray
Write-Host ""

# Paste your connection string here
$RENDER_HOST = "YOUR_HOST.oregon-postgres.render.com"  # e.g., dpg-xxxxx.oregon-postgres.render.com
$RENDER_USER = "mandiapp_db_user"  # Usually ends with _user
$RENDER_DB = "mandiapp_db"  # Usually ends with _db
$RENDER_PASSWORD = "YOUR_PASSWORD"  # Get from Render dashboard

Write-Host "UPDATE THE SCRIPT WITH YOUR RENDER DATABASE CREDENTIALS ABOVE!" -ForegroundColor Red
Write-Host "Then run this script again." -ForegroundColor Red
Write-Host ""
Read-Host "Press Enter to exit"
exit

# Uncomment below after adding credentials
<#
$env:PGPASSWORD = $RENDER_PASSWORD

Write-Host "Connecting to Render PostgreSQL..." -ForegroundColor Cyan

psql -h $RENDER_HOST -U $RENDER_USER -d $RENDER_DB -c "ALTER TABLE \`"AspNetUsers\`" ADD COLUMN IF NOT EXISTS \`"Language\`" VARCHAR(10) NOT NULL DEFAULT 'en';"

if ($LASTEXITCODE -eq 0) {
    Write-Host "Success! Language column added to Render database" -ForegroundColor Green
    Write-Host "You can now use OTP 123456 in your app" -ForegroundColor Green
} else {
    Write-Host "Failed. Error code: $LASTEXITCODE" -ForegroundColor Red
}

Remove-Item Env:\PGPASSWORD
#>
