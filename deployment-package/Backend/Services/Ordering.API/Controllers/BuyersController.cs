using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Ordering.API.Models;
using Ordering.API.Services;

namespace Ordering.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class BuyersController : ControllerBase
{
    private readonly IBuyerService _buyerService;
    private readonly ILogger<BuyersController> _logger;

    public BuyersController(IBuyerService buyerService, ILogger<BuyersController> logger)
    {
        _buyerService = buyerService;
        _logger = logger;
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetBuyer(string id)
    {
        var buyer = await _buyerService.GetByIdAsync(id);
        if (buyer == null)
            return NotFound(new { message = "Buyer not found" });

        return Ok(buyer);
    }

    [HttpPost]
    public async Task<IActionResult> CreateBuyer([FromBody] Buyer buyer)
    {
        var created = await _buyerService.CreateAsync(buyer);
        _logger.LogInformation($"Buyer created: {created.Id} - {created.FullName}");
        return CreatedAtAction(nameof(GetBuyer), new { id = created.Id }, created);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateBuyer(string id, [FromBody] Buyer buyer)
    {
        if (id != buyer.Id)
            return BadRequest(new { message = "ID mismatch" });

        var updated = await _buyerService.UpdateAsync(id, buyer);
        if (updated == null)
            return NotFound(new { message = "Buyer not found" });

        return Ok(updated);
    }

    [HttpGet("{id}/orders")]
    public async Task<IActionResult> GetBuyerOrders(string id)
    {
        var orders = await _buyerService.GetOrdersAsync(id);
        return Ok(orders);
    }

    [HttpGet("{id}/stats")]
    public async Task<IActionResult> GetBuyerStats(string id)
    {
        var stats = await _buyerService.GetStatsAsync(id);
        return Ok(stats);
    }
}
