using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Marketplace.API.Data;

namespace Marketplace.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SeedController : ControllerBase
{
    private readonly MarketplaceDbContext _context;
    private readonly ILogger<SeedController> _logger;

    public SeedController(MarketplaceDbContext context, ILogger<SeedController> logger)
    {
        _context = context;
        _logger = logger;
    }

    [HttpPost("master-products")]
    public async Task<IActionResult> SeedMasterProducts()
    {
        try
        {
            _logger.LogInformation("🌱 Starting master products seeding...");

            // First create the MasterProducts table
            await _context.Database.ExecuteSqlRawAsync(@"
                CREATE TABLE IF NOT EXISTS ""MasterProducts"" (
                    ""Id"" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    ""Name"" VARCHAR(200) NOT NULL,
                    ""NameHindi"" VARCHAR(200),
                    ""Category"" VARCHAR(100) NOT NULL,
                    ""SubCategory"" VARCHAR(100),
                    ""Description"" TEXT,
                    ""Unit"" VARCHAR(50) NOT NULL DEFAULT 'kg',
                    ""ImageUrls"" TEXT[],
                    ""CreatedAt"" TIMESTAMP NOT NULL DEFAULT NOW(),
                    ""UpdatedAt"" TIMESTAMP NOT NULL DEFAULT NOW()
                );
                
                CREATE INDEX IF NOT EXISTS idx_master_products_category ON ""MasterProducts""(""Category"");
                CREATE INDEX IF NOT EXISTS idx_master_products_name ON ""MasterProducts""(""Name"");
            ");

            _logger.LogInformation("✅ MasterProducts table created");

            // Check if already seeded
            var existingCount = await _context.Database.ExecuteSqlRawAsync(
                @"SELECT COUNT(*) FROM ""MasterProducts"""
            );

            _logger.LogInformation($"📊 Existing products count: {existingCount}");

            // Seed the products (you'll need to paste the INSERT statements here)
            // For now, return success
            return Ok(new { 
                message = "Master products table created. Run the seed-master-products.sql file in your database to insert products.",
                tableCreated = true
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ Error seeding master products");
            return StatusCode(500, new { message = "Seeding failed", error = ex.Message });
        }
    }
}
