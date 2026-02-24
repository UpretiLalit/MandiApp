# Add IsLive column to MasterProducts table
Write-Host "Adding IsLive column to MasterProducts table..." -ForegroundColor Cyan

$connectionString = "Server=tcp:mandiapp-server.database.windows.net,1433;Initial Catalog=MandiAppDB;Persist Security Info=False;User ID=mandiapp_admin;Password=MandiApp@2024;MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;"

$sqlFile = ".\ADD_ISLIVE_COLUMN.sql"

if (Test-Path $sqlFile) {
    try {
        sqlcmd -S "mandiapp-server.database.windows.net" `
               -d "MandiAppDB" `
               -U "mandiapp_admin" `
               -P "MandiApp@2024" `
               -i $sqlFile `
               -C
        
        Write-Host "✅ IsLive column added successfully!" -ForegroundColor Green
    }
    catch {
        Write-Host "❌ Error running migration: $_" -ForegroundColor Red
    }
}
else {
    Write-Host "❌ SQL file not found: $sqlFile" -ForegroundColor Red
}

Write-Host "`nPress any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
