using System;
using System.Threading.Tasks;
using Npgsql;

class Program
{
    static async Task Main(string[] args)
    {
        var connectionString = "Host=db.iytscokxxuxprrivmzvg.supabase.co;Port=5432;Database=postgres;Username=postgres;Password=PYvWmYoMYiO3RiCJ;SSL Mode=Require;Trust Server Certificate=true";
        
        Console.WriteLine("Checking database tables...");
        Console.WriteLine("=====================================\n");
        
        try
        {
            await using var conn = new NpgsqlConnection(connectionString);
            await conn.OpenAsync();
            
            // Query to list all tables
            var query = @"
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_type = 'BASE TABLE'
                ORDER BY table_name;
            ";
            
            await using var cmd = new NpgsqlCommand(query, conn);
            await using var reader = await cmd.ExecuteReaderAsync();
            
            int count = 0;
            while (await reader.ReadAsync())
            {
                var tableName = reader.GetString(0);
                Console.WriteLine($"  {++count,2}. {tableName}");
            }
            
            Console.WriteLine($"\n✓ Total: {count} tables in database");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"✗ Error: {ex.Message}");
            Environment.Exit(1);
        }
    }
}
