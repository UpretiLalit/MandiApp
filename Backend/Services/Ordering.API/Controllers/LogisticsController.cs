using Microsoft.AspNetCore.Mvc;
using Ordering.API.Services;

namespace Ordering.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class LogisticsController : ControllerBase
{
    private readonly ILogisticsService _logisticsService;
    private readonly ILogger<LogisticsController> _logger;

    public LogisticsController(
        ILogisticsService logisticsService,
        ILogger<LogisticsController> logger)
    {
        _logisticsService = logisticsService;
        _logger = logger;
    }

    [HttpGet("heatmap")]
    public async Task<IActionResult> GetMandiHeatmap()
    {
        try
        {
            var heatmap = await _logisticsService.GetMandiHeatmapAsync();
            return Ok(heatmap);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting mandi heatmap");
            return StatusCode(500, "An error occurred while retrieving heatmap data");
        }
    }

    [HttpGet("stuck-orders")]
    public async Task<IActionResult> GetStuckOrders([FromQuery] int threshold = 30)
    {
        try
        {
            var stuckOrders = await _logisticsService.GetStuckOrdersAsync(threshold);
            return Ok(stuckOrders);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting stuck orders");
            return StatusCode(500, "An error occurred while retrieving stuck orders");
        }
    }

    [HttpGet("available-transporters")]
    public async Task<IActionResult> GetAvailableTransporters([FromQuery] string? mandiId = null)
    {
        try
        {
            var transporters = await _logisticsService.GetAvailableTransportersAsync(mandiId);
            return Ok(transporters);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting available transporters");
            return StatusCode(500, "An error occurred while retrieving transporters");
        }
    }

    [HttpPost("orders/{orderId}/reassign")]
    public async Task<IActionResult> ReassignOrder(int orderId, [FromBody] ReassignRequest request)
    {
        try
        {
            var success = await _logisticsService.ReassignOrderAsync(orderId, request.NewTransporterId);
            if (!success)
                return BadRequest(new { message = "Failed to reassign order" });

            return Ok(new { message = "Order reassigned successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error reassigning order {OrderId}", orderId);
            return StatusCode(500, "An error occurred while reassigning order");
        }
    }

    [HttpPost("orders/{orderId}/flag")]
    public async Task<IActionResult> FlagStuckOrder(int orderId)
    {
        try
        {
            var success = await _logisticsService.FlagStuckOrderAsync(orderId);
            if (!success)
                return NotFound(new { message = "Order not found" });

            return Ok(new { message = "Order flagged successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error flagging order {OrderId}", orderId);
            return StatusCode(500, "An error occurred while flagging order");
        }
    }
}

public record ReassignRequest(string NewTransporterId);
