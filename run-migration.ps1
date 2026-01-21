# MandiApp Database Migration Script
# Executes SQL migration on Supabase

$connectionString = "Host=db.iytscokxxuxprrivmzvg.supabase.co;Port=5432;Database=postgres;Username=postgres;Password=PYvWmYoMYiO3RiCJ;SSL Mode=Require;Trust Server Certificate=true"

Write-Host "Starting database migration..." -ForegroundColor Cyan

# Read the SQL file
$sqlScript = Get-Content -Path "d:\MandiApp\migrate-all-tables.sql" -Raw

# Use Npgsql to execute the migration
Add-Type -Path "$env:USERPROFILE\.nuget\packages\npgsql\6.0.0\lib\netstandard2.0\Npgsql.dll" -ErrorAction SilentlyContinue

if (-not ([System.Management.Automation.PSTypeName]'Npgsql.NpgsqlConnection').Type) {
    Write-Host "Npgsql not found. Installing via dotnet..." -ForegroundColor Yellow
    
    # Create a temporary project to use Npgsql
    $tempDir = "$env:TEMP\MandoDbMigration"
    if (Test-Path $tempDir) {
        Remove-Item $tempDir -Recurse -Force
    }
    New-Item -ItemType Directory -Path $tempDir | Out-Null
    
    Push-Location $tempDir
    
    # Create a simple console app
    dotnet new console --force | Out-Null
    dotnet add package Npgsql --version 8.0.0 | Out-Null
    
    # Create migration runner
    @"
using System;
using System.IO;
using Npgsql;

class Program
{
    static async Task Main(string[] args)
    {
        var connectionString = args[0];
        var sqlFile = args[1];
        
        try
        {
            var sql = await File.ReadAllTextAsync(sqlFile);
            
            await using var conn = new NpgsqlConnection(connectionString);
            await conn.OpenAsync();
            
            Console.WriteLine("Connected to database successfully!");
            
            await using var cmd = new NpgsqlCommand(sql, conn);
            cmd.CommandTimeout = 300; // 5 minutes
            
            await cmd.ExecuteNonQueryAsync();
            
            Console.WriteLine("✓ Migration completed successfully!");
        }
        catch (Exception ex)
        {
            Console.WriteLine("✗ Migration failed: " + ex.Message);
            Console.WriteLine(ex.StackTrace);
            Environment.Exit(1);
        }
    }
}
"@ | Out-File -FilePath "Program.cs" -Encoding UTF8
    
    Write-Host "Building migration runner..." -ForegroundColor Yellow
    dotnet build -c Release | Out-Null
    
    Write-Host "Executing migration..." -ForegroundColor Yellow
    dotnet run --no-build -c Release -- $connectionString "d:\MandiApp\migrate-all-tables.sql"
    
    Pop-Location
    Remove-Item $tempDir -Recurse -Force
}
else {
    # Execute using loaded Npgsql
    try {
        $conn = New-Object Npgsql.NpgsqlConnection($connectionString)
        $conn.Open()
        
        Write-Host "✓ Connected to database successfully!" -ForegroundColor Green
        
        $cmd = New-Object Npgsql.NpgsqlCommand($sqlScript, $conn)
        $cmd.CommandTimeout = 300
        
        $cmd.ExecuteNonQuery() | Out-Null
        
        Write-Host "✓ Migration completed successfully!" -ForegroundColor Green
        
        $conn.Close()
    }
    catch {
        Write-Host "✗ Migration failed: $($_.Exception.Message)" -ForegroundColor Red
        exit 1
    }
}

Write-Host "`nDatabase migration completed!" -ForegroundColor Green
Write-Host "All tables have been created with Row-Level Security enabled." -ForegroundColor Cyan
