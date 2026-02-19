# Add Language column to AspNetUsers table in Supabase PostgreSQL

$env:PGPASSWORD = "PYvWmYoMYiO3RiCJ"

Write-Host "Connecting to Supabase PostgreSQL..." -ForegroundColor Cyan

psql -h db.iytscokxxuxprrivmzvg.supabase.co -p 5432 -U postgres -d postgres -c "ALTER TABLE \`"AspNetUsers\`" ADD COLUMN IF NOT EXISTS \`"Language\`" VARCHAR(10) NOT NULL DEFAULT 'en';"

if ($LASTEXITCODE -eq 0) {
    Write-Host "Success! Language column added" -ForegroundColor Green
    Write-Host "You can now use OTP 123456 in your app" -ForegroundColor Green
} else {
    Write-Host "Failed to add column. Error code: $LASTEXITCODE" -ForegroundColor Red
    Write-Host "Make sure PostgreSQL client (psql) is installed" -ForegroundColor Yellow
    Write-Host "Download from: https://www.postgresql.org/download/windows/" -ForegroundColor Yellow
}

Remove-Item Env:\PGPASSWORD
