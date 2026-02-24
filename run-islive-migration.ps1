# ============================================================
# Add IsLive Column to MasterProducts - PostgreSQL/Supabase
# ============================================================

Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   Adding IsLive Column to MasterProducts Table            ║" -ForegroundColor Cyan
Write-Host "║   Database: Supabase PostgreSQL                           ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Supabase connection details
$host = "db.iytscokxxuxprrivmzvg.supabase.co"
$port = "5432"
$database = "postgres"
$username = "postgres"
$password = "PYvWmYoMYiO3RiCJ"

$sqlFile = "add-islive-column-postgres.sql"

if (-not (Test-Path $sqlFile)) {
    Write-Host "❌ SQL file not found: $sqlFile" -ForegroundColor Red
    exit 1
}

Write-Host "📝 Reading SQL migration script..." -ForegroundColor Gray
$sqlContent = Get-Content $sqlFile -Raw

Write-Host "🔌 Connecting to Supabase PostgreSQL..." -ForegroundColor Yellow
Write-Host "   Host: $host" -ForegroundColor Gray
Write-Host "   Database: $database" -ForegroundColor Gray
Write-Host ""

# Method 1: Try using psql command (if available)
$psqlPath = Get-Command psql -ErrorAction SilentlyContinue

if ($psqlPath) {
    Write-Host "🔧 Using psql command..." -ForegroundColor Cyan
    
    $env:PGPASSWORD = $password
    
    try {
        psql -h $host -p $port -U $username -d $database -f $sqlFile
        
        Write-Host "`n✅ Migration completed successfully!" -ForegroundColor Green
    }
    catch {
        Write-Host "❌ Error running migration with psql: $_" -ForegroundColor Red
    }
    finally {
        Remove-Item Env:\PGPASSWORD -ErrorAction SilentlyContinue
    }
}
else {
    # Method 2: Use .NET Npgsql library via inline C#
    Write-Host "🔧 Using Npgsql library..." -ForegroundColor Cyan
    
    $code = @"
using System;
using System.Data;
using Npgsql;

public class PostgresRunner {
    public static void ExecuteSql(string connectionString, string sql) {
        using (var conn = new NpgsqlConnection(connectionString)) {
            conn.Open();
            using (var cmd = new NpgsqlCommand(sql, conn)) {
                cmd.CommandTimeout = 60;
                
                using (var reader = cmd.ExecuteReader()) {
                    while (reader.Read()) {
                        for (int i = 0; i < reader.FieldCount; i++) {
                            Console.WriteLine($"{reader.GetName(i)}: {reader.GetValue(i)}");
                        }
                        Console.WriteLine();
                    }
                }
            }
        }
    }
}
"@

    try {
        # Load Npgsql from NuGet package in backend project
        $npgsqlDll = Get-ChildItem -Path "Backend\Services\Marketplace.API\bin" -Filter "Npgsql.dll" -Recurse -ErrorAction SilentlyContinue | Select-Object -First 1
        
        if ($npgsqlDll) {
            Add-Type -Path $npgsqlDll.FullName
            Add-Type -TypeDefinition $code -ReferencedAssemblies $npgsqlDll.FullName
            
            $connectionString = "Host=$host;Port=$port;Database=$database;Username=$username;Password=$password;SSL Mode=Require;Trust Server Certificate=true"
            
            [PostgresRunner]::ExecuteSql($connectionString, $sqlContent)
            
            Write-Host "`n✅ Migration completed successfully!" -ForegroundColor Green
        }
        else {
            Write-Host "❌ Npgsql.dll not found. Please ensure the backend is built." -ForegroundColor Red
            Write-Host "`n💡 Alternative: Run migration through backend API or use pgAdmin." -ForegroundColor Yellow
        }
    }
    catch {
        Write-Host "❌ Error: $_" -ForegroundColor Red
        Write-Host "`n💡 To run migration manually:" -ForegroundColor Yellow
        Write-Host "   1. Open Supabase dashboard: https://supabase.com/dashboard" -ForegroundColor White
        Write-Host "   2. Go to SQL Editor" -ForegroundColor White
        Write-Host "   3. Copy and paste content from: $sqlFile" -ForegroundColor White
        Write-Host "   4. Click 'Run'" -ForegroundColor White
    }
}

Write-Host ""
