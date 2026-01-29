namespace Ordering.API.Services;

public class ProductService : IProductService
{
    public async Task<IEnumerable<object>> GetAllProductsAsync()
    {
        // In a real application, this would query from database
        // For now, return structured mock data
        return await Task.FromResult(GetMockProducts());
    }

    public async Task<object?> GetProductByIdAsync(int id)
    {
        var products = GetMockProducts();
        return await Task.FromResult(products.FirstOrDefault(p => ((dynamic)p).id == id));
    }

    public async Task<IEnumerable<object>> GetProductsByCategoryAsync(string category)
    {
        var products = GetMockProducts();
        return await Task.FromResult(products.Where(p => 
            ((dynamic)p).category.Equals(category, StringComparison.OrdinalIgnoreCase)));
    }

    private IEnumerable<object> GetMockProducts()
    {
        return new[]
        {
            new
            {
                id = 1,
                name = "Tomatoes",
                category = "Vegetables",
                emoji = "🍅",
                unit = "Peti (Box)",
                unitWeight = "20kg per box",
                currentPrice = 800,
                vendors = new[]
                {
                    new { vendorId = "V1", vendorName = "Fresh Farms Co.", price = 800, pricePerUnit = "₹800/Box", grade = "A", quantity = 25, minOrderQty = 2, maxOrderQty = 10, vendorRating = 4.5 },
                    new { vendorId = "V2", vendorName = "Green Valley", price = 840, pricePerUnit = "₹840/Box", grade = "A", quantity = 15, minOrderQty = 2, maxOrderQty = 8, vendorRating = 4.3 },
                    new { vendorId = "V3", vendorName = "Sunrise Produce", price = 760, pricePerUnit = "₹760/Box", grade = "B", quantity = 20, minOrderQty = 3, maxOrderQty = 15, vendorRating = 4.2 }
                }
            },
            new
            {
                id = 2,
                name = "Onions",
                category = "Vegetables",
                emoji = "🧅",
                unit = "Quintal",
                unitWeight = "100kg per quintal",
                currentPrice = 3000,
                vendors = new[]
                {
                    new { vendorId = "V1", vendorName = "Fresh Farms Co.", price = 3000, pricePerUnit = "₹3,000/Quintal", grade = "A", quantity = 8, minOrderQty = 1, maxOrderQty = 5, vendorRating = 4.5 },
                    new { vendorId = "V4", vendorName = "Farm Direct", price = 3200, pricePerUnit = "₹3,200/Quintal", grade = "A", quantity = 6, minOrderQty = 1, maxOrderQty = 6, vendorRating = 4.4 }
                }
            },
            new
            {
                id = 3,
                name = "Potatoes",
                category = "Vegetables",
                emoji = "🥔",
                unit = "Quintal",
                unitWeight = "100kg per quintal",
                currentPrice = 2500,
                vendors = new[]
                {
                    new { vendorId = "V1", vendorName = "Fresh Farms Co.", price = 2500, pricePerUnit = "₹2,500/Quintal", grade = "A", quantity = 10, minOrderQty = 1, maxOrderQty = 8, vendorRating = 4.5 },
                    new { vendorId = "V2", vendorName = "Green Valley", price = 2400, pricePerUnit = "₹2,400/Quintal", grade = "B", quantity = 12, minOrderQty = 2, maxOrderQty = 10, vendorRating = 4.3 }
                }
            },
            new
            {
                id = 4,
                name = "Carrots",
                category = "Vegetables",
                emoji = "🥕",
                unit = "Peti (Box)",
                unitWeight = "25kg per box",
                currentPrice = 950,
                vendors = new[]
                {
                    new { vendorId = "V3", vendorName = "Sunrise Produce", price = 950, pricePerUnit = "₹950/Box", grade = "A", quantity = 18, minOrderQty = 2, maxOrderQty = 12, vendorRating = 4.2 },
                    new { vendorId = "V4", vendorName = "Farm Direct", price = 1000, pricePerUnit = "₹1,000/Box", grade = "A", quantity = 15, minOrderQty = 2, maxOrderQty = 10, vendorRating = 4.4 }
                }
            },
            new
            {
                id = 5,
                name = "Cauliflower",
                category = "Vegetables",
                emoji = "🥦",
                unit = "Peti (Box)",
                unitWeight = "15kg per box",
                currentPrice = 1200,
                vendors = new[]
                {
                    new { vendorId = "V1", vendorName = "Fresh Farms Co.", price = 1200, pricePerUnit = "₹1,200/Box", grade = "A", quantity = 20, minOrderQty = 2, maxOrderQty = 8, vendorRating = 4.5 },
                    new { vendorId = "V2", vendorName = "Green Valley", price = 1150, pricePerUnit = "₹1,150/Box", grade = "B", quantity = 14, minOrderQty = 2, maxOrderQty = 10, vendorRating = 4.3 }
                }
            },
            new
            {
                id = 6,
                name = "Cabbage",
                category = "Vegetables",
                emoji = "🥬",
                unit = "Peti (Box)",
                unitWeight = "20kg per box",
                currentPrice = 700,
                vendors = new[]
                {
                    new { vendorId = "V3", vendorName = "Sunrise Produce", price = 700, pricePerUnit = "₹700/Box", grade = "A", quantity = 22, minOrderQty = 2, maxOrderQty = 15, vendorRating = 4.2 },
                    new { vendorId = "V4", vendorName = "Farm Direct", price = 750, pricePerUnit = "₹750/Box", grade = "A", quantity = 18, minOrderQty = 2, maxOrderQty = 12, vendorRating = 4.4 }
                }
            },
            new
            {
                id = 7,
                name = "Mangoes",
                category = "Fruits",
                emoji = "🥭",
                unit = "Peti (Box)",
                unitWeight = "10kg per box",
                currentPrice = 2500,
                vendors = new[]
                {
                    new { vendorId = "V1", vendorName = "Fresh Farms Co.", price = 2500, pricePerUnit = "₹2,500/Box", grade = "A", quantity = 30, minOrderQty = 2, maxOrderQty = 10, vendorRating = 4.5 },
                    new { vendorId = "V5", vendorName = "Tropical Traders", price = 2400, pricePerUnit = "₹2,400/Box", grade = "B", quantity = 25, minOrderQty = 3, maxOrderQty = 12, vendorRating = 4.1 }
                }
            },
            new
            {
                id = 8,
                name = "Bananas",
                category = "Fruits",
                emoji = "🍌",
                unit = "Dozen Bunches",
                unitWeight = "~15kg per dozen",
                currentPrice = 600,
                vendors = new[]
                {
                    new { vendorId = "V2", vendorName = "Green Valley", price = 600, pricePerUnit = "₹600/Dozen", grade = "A", quantity = 40, minOrderQty = 5, maxOrderQty = 20, vendorRating = 4.3 },
                    new { vendorId = "V5", vendorName = "Tropical Traders", price = 580, pricePerUnit = "₹580/Dozen", grade = "B", quantity = 35, minOrderQty = 5, maxOrderQty = 25, vendorRating = 4.1 }
                }
            },
            new
            {
                id = 9,
                name = "Apples",
                category = "Fruits",
                emoji = "🍎",
                unit = "Peti (Box)",
                unitWeight = "18kg per box",
                currentPrice = 3500,
                vendors = new[]
                {
                    new { vendorId = "V1", vendorName = "Fresh Farms Co.", price = 3500, pricePerUnit = "₹3,500/Box", grade = "A", quantity = 15, minOrderQty = 2, maxOrderQty = 8, vendorRating = 4.5 },
                    new { vendorId = "V4", vendorName = "Farm Direct", price = 3400, pricePerUnit = "₹3,400/Box", grade = "A", quantity = 12, minOrderQty = 2, maxOrderQty = 10, vendorRating = 4.4 }
                }
            },
            new
            {
                id = 10,
                name = "Grapes",
                category = "Fruits",
                emoji = "🍇",
                unit = "Peti (Box)",
                unitWeight = "8kg per box",
                currentPrice = 2000,
                vendors = new[]
                {
                    new { vendorId = "V3", vendorName = "Sunrise Produce", price = 2000, pricePerUnit = "₹2,000/Box", grade = "A", quantity = 20, minOrderQty = 3, maxOrderQty = 15, vendorRating = 4.2 },
                    new { vendorId = "V5", vendorName = "Tropical Traders", price = 1900, pricePerUnit = "₹1,900/Box", grade = "B", quantity = 18, minOrderQty = 3, maxOrderQty = 12, vendorRating = 4.1 }
                }
            }
        };
    }
}
