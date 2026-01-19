using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Ordering.API.Hubs;

namespace Ordering.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PriceTestController : ControllerBase
{
    private readonly IHubContext<PriceHub> _priceHubContext;
    private readonly ILogger<PriceTestController> _logger;

    public PriceTestController(
        IHubContext<PriceHub> priceHubContext,
        ILogger<PriceTestController> logger)
    {
        _priceHubContext = priceHubContext;
        _logger = logger;
    }

    [HttpPost("update-price")]
    public async Task<IActionResult> UpdatePrice([FromBody] PriceUpdateRequest request)
    {
        try
        {
            _logger.LogInformation($"Broadcasting price update: Product {request.ProductId}, Vendor {request.VendorId}, Price: {request.NewPrice}");

            // Broadcast to all connected clients
            await _priceHubContext.Clients.All.SendAsync("PriceUpdated", new
            {
                productId = request.ProductId,
                vendorId = request.VendorId,
                newPrice = request.NewPrice,
                timestamp = DateTime.UtcNow
            });

            return Ok(new { 
                success = true, 
                message = "Price update broadcasted successfully" 
            });
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error broadcasting price update: {ex.Message}");
            return StatusCode(500, new { 
                success = false, 
                message = "Error broadcasting price update",
                error = ex.Message 
            });
        }
    }

    [HttpPost("simulate-price-drop")]
    public async Task<IActionResult> SimulatePriceDrop()
    {
        try
        {
            // Simulate random price drops for testing
            var random = new Random();
            var productIds = new[] { "1", "3", "5", "7", "9" };
            var vendorIds = new[] { "1", "2" };

            var productId = productIds[random.Next(productIds.Length)];
            var vendorId = vendorIds[random.Next(vendorIds.Length)];
            var priceReduction = random.Next(2, 10);
            var newPrice = random.Next(20, 100) - priceReduction;

            await _priceHubContext.Clients.All.SendAsync("PriceUpdated", new
            {
                productId,
                vendorId,
                newPrice = (decimal)newPrice,
                timestamp = DateTime.UtcNow
            });

            _logger.LogInformation($"Simulated price drop: Product {productId}, Vendor {vendorId}, New Price: {newPrice}");

            return Ok(new
            {
                success = true,
                message = "Price drop simulated",
                data = new { productId, vendorId, newPrice }
            });
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error simulating price drop: {ex.Message}");
            return StatusCode(500, new { 
                success = false, 
                message = "Error simulating price drop",
                error = ex.Message 
            });
        }
    }
}

public class PriceUpdateRequest
{
    public string ProductId { get; set; } = string.Empty;
    public string VendorId { get; set; } = string.Empty;
    public decimal NewPrice { get; set; }
}
