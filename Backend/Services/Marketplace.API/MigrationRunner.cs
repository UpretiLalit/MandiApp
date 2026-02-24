using Microsoft.EntityFrameworkCore;
using Marketplace.API.Data;

var host = Host.CreateDefaultBuilder(args)
    .ConfigureServices((context, services) =>
    {
        var connectionString = "Host=db.iytscokxxuxprrivmzvg.supabase.co;Port=5432;Database=postgres;User Id=postgres;Password=PYvWmYoMYiO3RiCJ;Ssl Mode=Require;Trust Server Certificate=true";
        
        services.AddDbContext<MarketplaceDbContext>(options =>
            options.UseNpgsql(connectionString));
    })
    .Build();

using var scope = host.Services.CreateScope();
var dbContext = scope.ServiceProvider.GetRequiredService<MarketplaceDbContext>();

Console.WriteLine("🔌 Connecting to database...");

try
{
    // Check if column exists
    var checkSql = @"
        SELECT COUNT(*) 
        FROM information_schema.columns 
        WHERE table_name = 'MasterProducts' 
        AND column_name = 'IsLive'";
    
    var exists = await dbContext.Database.ExecuteSqlRawAsync(checkSql);
    
    if (exists == 0)
    {
        Console.WriteLine("📝 Adding IsLive column...");
        
        await dbContext.Database.ExecuteSqlRawAsync(@"
            ALTER TABLE ""MasterProducts""
            ADD COLUMN ""IsLive"" BOOLEAN NOT NULL DEFAULT false;
        ");
        
        Console.WriteLine("✅ Column added successfully!");
        
        // Make all products live
        Console.WriteLine("📝 Setting all products to live...");
        await dbContext.Database.ExecuteSqlRawAsync(@"
            UPDATE ""MasterProducts""
            SET ""IsLive"" = true;
        ");
        
        Console.WriteLine("✅ All products set to live!");
    }
    else
    {
        Console.WriteLine("ℹ️  IsLive column already exists");
    }
    
    // Verify
    var stats = await dbContext.Database.SqlQueryRaw<MigrationStats>(@"
        SELECT 
            COUNT(*) as TotalProducts, 
            SUM(CASE WHEN ""IsLive"" = true THEN 1 ELSE 0 END) as LiveProducts
        FROM ""MasterProducts""
    ").ToListAsync();
    
    if (stats.Any())
    {
        Console.WriteLine($"\n📊 Statistics:");
        Console.WriteLine($"   Total Products: {stats[0].TotalProducts}");
        Console.WriteLine($"   Live Products: {stats[0].LiveProducts}");
    }
}
catch (Exception ex)
{
    Console.WriteLine($"❌ Error: {ex.Message}");
    return 1;
}

Console.WriteLine("\n✅ Migration completed successfully!");
return 0;

public class MigrationStats
{
    public int TotalProducts { get; set; }
    public int LiveProducts { get; set; }
}
