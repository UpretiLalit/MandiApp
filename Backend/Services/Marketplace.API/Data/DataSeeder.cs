using Marketplace.API.Models;

namespace Marketplace.API.Data;

public static class DataSeeder
{
    public static async Task SeedMockDataAsync(MarketplaceDbContext context)
    {
        // Check if we already have data
        if (context.Products.Any())
            return;

        var products = new List<Product>
        {
            // Tomatoes
            new Product
            {
                VendorId = "vendor-001",
                Name = "Fresh Tomatoes",
                Category = "Vegetables",
                Description = "Premium quality red tomatoes",
                Unit = "kg",
                CurrentPrice = 45.00m,
                AvailableQuantity = 500,
                ImageUrl = "https://example.com/tomato.jpg",
                IsActive = true,
                Emoji = "🍅",
                Grade = "A",
                UpdatedAt = DateTime.UtcNow.AddMinutes(-5)
            },
            new Product
            {
                VendorId = "vendor-002",
                Name = "Fresh Tomatoes",
                Category = "Vegetables",
                Description = "Fresh farm tomatoes",
                Unit = "kg",
                CurrentPrice = 42.00m,
                AvailableQuantity = 300,
                ImageUrl = "https://example.com/tomato.jpg",
                IsActive = true,
                Emoji = "🍅",
                Grade = "B",
                UpdatedAt = DateTime.UtcNow.AddMinutes(-10)
            },
            new Product
            {
                VendorId = "vendor-003",
                Name = "Fresh Tomatoes",
                Category = "Vegetables",
                Description = "Organic tomatoes",
                Unit = "kg",
                CurrentPrice = 50.00m,
                AvailableQuantity = 200,
                ImageUrl = "https://example.com/tomato.jpg",
                IsActive = true,
                Emoji = "🍅",
                Grade = "Premium",
                UpdatedAt = DateTime.UtcNow.AddMinutes(-3)
            },
            
            // Onions
            new Product
            {
                VendorId = "vendor-001",
                Name = "Red Onions",
                Category = "Vegetables",
                Description = "Fresh red onions",
                Unit = "kg",
                CurrentPrice = 35.00m,
                AvailableQuantity = 400,
                ImageUrl = "https://example.com/onion.jpg",
                IsActive = true,
                Emoji = "🧅",
                Grade = "A",
                UpdatedAt = DateTime.UtcNow.AddMinutes(-7)
            },
            new Product
            {
                VendorId = "vendor-004",
                Name = "Red Onions",
                Category = "Vegetables",
                Description = "Premium onions",
                Unit = "kg",
                CurrentPrice = 32.00m,
                AvailableQuantity = 350,
                ImageUrl = "https://example.com/onion.jpg",
                IsActive = true,
                Emoji = "🧅",
                Grade = "B",
                UpdatedAt = DateTime.UtcNow.AddMinutes(-15)
            },
            
            // Potatoes
            new Product
            {
                VendorId = "vendor-002",
                Name = "Potatoes",
                Category = "Vegetables",
                Description = "Fresh potatoes",
                Unit = "kg",
                CurrentPrice = 28.00m,
                AvailableQuantity = 600,
                ImageUrl = "https://example.com/potato.jpg",
                IsActive = true,
                Emoji = "🥔",
                Grade = "A",
                UpdatedAt = DateTime.UtcNow.AddMinutes(-12)
            },
            new Product
            {
                VendorId = "vendor-005",
                Name = "Potatoes",
                Category = "Vegetables",
                Description = "Farm fresh potatoes",
                Unit = "kg",
                CurrentPrice = 25.00m,
                AvailableQuantity = 450,
                ImageUrl = "https://example.com/potato.jpg",
                IsActive = true,
                Emoji = "🥔",
                Grade = "B",
                UpdatedAt = DateTime.UtcNow.AddMinutes(-8)
            },
            
            // Carrots
            new Product
            {
                VendorId = "vendor-003",
                Name = "Carrots",
                Category = "Vegetables",
                Description = "Fresh carrots",
                Unit = "kg",
                CurrentPrice = 40.00m,
                AvailableQuantity = 250,
                ImageUrl = "https://example.com/carrot.jpg",
                IsActive = true,
                Emoji = "🥕",
                Grade = "A",
                UpdatedAt = DateTime.UtcNow.AddMinutes(-6)
            },
            
            // Cabbage
            new Product
            {
                VendorId = "vendor-004",
                Name = "Cabbage",
                Category = "Vegetables",
                Description = "Fresh green cabbage",
                Unit = "kg",
                CurrentPrice = 22.00m,
                AvailableQuantity = 300,
                ImageUrl = "https://example.com/cabbage.jpg",
                IsActive = true,
                Emoji = "🥬",
                Grade = "A",
                UpdatedAt = DateTime.UtcNow.AddMinutes(-4)
            },
            
            // Cauliflower
            new Product
            {
                VendorId = "vendor-005",
                Name = "Cauliflower",
                Category = "Vegetables",
                Description = "Fresh cauliflower",
                Unit = "kg",
                CurrentPrice = 38.00m,
                AvailableQuantity = 200,
                ImageUrl = "https://example.com/cauliflower.jpg",
                IsActive = true,
                Emoji = "🥦",
                Grade = "A",
                UpdatedAt = DateTime.UtcNow.AddMinutes(-9)
            }
        };

        context.Products.AddRange(products);
        await context.SaveChangesAsync();

        // Add price history for first product
        var priceHistory = new PriceHistory
        {
            ProductId = 1,
            Price = 45.00m,
            ChangedBy = "vendor-001",
            ChangedAt = DateTime.UtcNow.AddMinutes(-5)
        };
        context.PriceHistories.Add(priceHistory);
        await context.SaveChangesAsync();

        Console.WriteLine($"✓ Seeded {products.Count} products with mock data");
    }
}
