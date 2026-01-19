using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Ordering.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[AllowAnonymous]
public class ProductsController : ControllerBase
{
    [HttpGet]
    public IActionResult GetProducts()
    {
        // Mock products for B2B marketplace with vendor-specific min/max order quantities
        var products = new[]
        {
            new
            {
                id = 1,
                name = "Tomatoes",
                category = "Vegetables",
                emoji = "🍅",
                unit = "Peti (Box)",  // Box of ~20kg
                unitWeight = "20kg per box",
                currentPrice = 800,  // Price per box
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
                unit = "Quintal",  // 100kg
                unitWeight = "100kg per quintal",
                currentPrice = 3000,  // Price per quintal
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
                unit = "Bora (Sack)",  // Sack of 50kg
                unitWeight = "50kg per sack",
                currentPrice = 1250,  // Price per sack
                vendors = new[]
                {
                    new { vendorId = "V2", vendorName = "Green Valley", price = 1250, pricePerUnit = "₹1,250/Sack", grade = "A", quantity = 20, minOrderQty = 2, maxOrderQty = 12, vendorRating = 4.3 },
                    new { vendorId = "V3", vendorName = "Sunrise Produce", price = 1350, pricePerUnit = "₹1,350/Sack", grade = "B", quantity = 14, minOrderQty = 2, maxOrderQty = 10, vendorRating = 4.2 }
                }
            },
            new
            {
                id = 4,
                name = "Carrots",
                category = "Vegetables",
                emoji = "🥕",
                unit = "Peti (Box)",  // Box of ~15kg
                unitWeight = "15kg per box",
                currentPrice = 525,  // Price per box
                vendors = new[]
                {
                    new { vendorId = "V1", vendorName = "Fresh Farms Co.", price = 525, pricePerUnit = "₹525/Box", grade = "A", quantity = 27, minOrderQty = 2, maxOrderQty = 20, vendorRating = 4.5 },
                    new { vendorId = "V4", vendorName = "Farm Direct", price = 540, pricePerUnit = "₹540/Box", grade = "A", quantity = 23, minOrderQty = 3, maxOrderQty = 15, vendorRating = 4.4 }
                }
            },
            new
            {
                id = 5,
                name = "Cabbage",
                category = "Vegetables",
                emoji = "🥬",
                unit = "Peti (Box)",  // Box of ~25kg
                unitWeight = "25kg per box",
                currentPrice = 500,  // Price per box
                vendors = new[]
                {
                    new { vendorId = "V2", vendorName = "Green Valley", price = 500, pricePerUnit = "₹500/Box", grade = "A", quantity = 12, minOrderQty = 2, maxOrderQty = 8, vendorRating = 4.3 },
                    new { vendorId = "V3", vendorName = "Sunrise Produce", price = 550, pricePerUnit = "₹550/Box", grade = "B", quantity = 10, minOrderQty = 3, maxOrderQty = 10, vendorRating = 4.2 }
                }
            },
            new
            {
                id = 6,
                name = "Apples",
                category = "Fruits",
                emoji = "🍎",
                unit = "Carton",  // Carton of ~20kg
                unitWeight = "20kg per carton",
                currentPrice = 2400,  // Price per carton
                vendors = new[]
                {
                    new { vendorId = "V1", vendorName = "Fresh Farms Co.", price = 2400, pricePerUnit = "₹2,400/Carton", grade = "A", quantity = 10, minOrderQty = 1, maxOrderQty = 5, vendorRating = 4.5 },
                    new { vendorId = "V2", vendorName = "Green Valley", price = 2500, pricePerUnit = "₹2,500/Carton", grade = "A", quantity = 8, minOrderQty = 1, maxOrderQty = 6, vendorRating = 4.3 }
                }
            },
            new
            {
                id = 7,
                name = "Bananas",
                category = "Fruits",
                emoji = "🍌",
                unit = "Dhadi (Bundle)",  // Bundle of ~30kg
                unitWeight = "30kg per bundle",
                currentPrice = 1500,  // Price per bundle
                vendors = new[]
                {
                    new { vendorId = "V3", vendorName = "Sunrise Produce", price = 1500, pricePerUnit = "₹1,500/Bundle", grade = "A", quantity = 17, minOrderQty = 1, maxOrderQty = 10, vendorRating = 4.2 },
                    new { vendorId = "V4", vendorName = "Farm Direct", price = 1560, pricePerUnit = "₹1,560/Bundle", grade = "B", quantity = 13, minOrderQty = 1, maxOrderQty = 8, vendorRating = 4.4 }
                }
            },
            new
            {
                id = 8,
                name = "Basmati Rice",
                category = "Grains",
                emoji = "🌾",
                unit = "Bora (Sack)",  // Sack of 50kg
                unitWeight = "50kg per sack",
                currentPrice = 4000,  // Price per sack
                vendors = new[]
                {
                    new { vendorId = "V1", vendorName = "Fresh Farms Co.", price = 4000, pricePerUnit = "₹4,000/Sack", grade = "A", quantity = 40, minOrderQty = 1, maxOrderQty = 20, vendorRating = 4.5 },
                    new { vendorId = "V2", vendorName = "Green Valley", price = 4100, pricePerUnit = "₹4,100/Sack", grade = "A", quantity = 30, minOrderQty = 2, maxOrderQty = 15, vendorRating = 4.3 }
                }
            },
            new
            {
                id = 9,
                name = "Wheat",
                category = "Grains",
                emoji = "🌾",
                unit = "Quintal",  // 100kg
                unitWeight = "100kg per quintal",
                currentPrice = 3500,  // Price per quintal
                vendors = new[]
                {
                    new { vendorId = "V4", vendorName = "Farm Direct", price = 3500, pricePerUnit = "₹3,500/Quintal", grade = "A", quantity = 50, minOrderQty = 1, maxOrderQty = 25, vendorRating = 4.4 },
                    new { vendorId = "V3", vendorName = "Sunrise Produce", price = 3600, pricePerUnit = "₹3,600/Quintal", grade = "B", quantity = 40, minOrderQty = 2, maxOrderQty = 20, vendorRating = 4.2 }
                }
            }
        };

        return Ok(products);
    }
}
