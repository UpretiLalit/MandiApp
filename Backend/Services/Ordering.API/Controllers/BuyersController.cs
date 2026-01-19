using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Ordering.API.Data;
using Ordering.API.Models;

namespace Ordering.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class BuyersController : ControllerBase
{
    private readonly OrderingDbContext _context;
    private readonly ILogger<BuyersController> _logger;

    public BuyersController(OrderingDbContext context, ILogger<BuyersController> logger)
    {
        _context = context;
        _logger = logger;
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetBuyer(string id)
    {
        var buyer = await _context.Buyers
            .Include(b => b.Orders)
            .FirstOrDefaultAsync(b => b.Id == id);

        if (buyer == null)
            return NotFound(new { message = "Buyer not found" });

        return Ok(buyer);
    }

    [HttpPost]
    public async Task<IActionResult> CreateBuyer([FromBody] Buyer buyer)
    {
        var existingBuyer = await _context.Buyers.FindAsync(buyer.Id);
        if (existingBuyer != null)
            return BadRequest(new { message = "Buyer already exists" });

        buyer.CreatedAt = DateTime.UtcNow;
        _context.Buyers.Add(buyer);
        await _context.SaveChangesAsync();

        _logger.LogInformation($"Buyer created: {buyer.Id} - {buyer.FullName}");

        return CreatedAtAction(nameof(GetBuyer), new { id = buyer.Id }, buyer);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateBuyer(string id, [FromBody] Buyer buyer)
    {
        if (id != buyer.Id)
            return BadRequest(new { message = "ID mismatch" });

        var existingBuyer = await _context.Buyers.FindAsync(id);
        if (existingBuyer == null)
            return NotFound(new { message = "Buyer not found" });

        existingBuyer.FullName = buyer.FullName;
        existingBuyer.Email = buyer.Email;
        existingBuyer.CompanyName = buyer.CompanyName;
        existingBuyer.GstNumber = buyer.GstNumber;
        existingBuyer.BusinessAddress = buyer.BusinessAddress;
        existingBuyer.DeliveryAddress = buyer.DeliveryAddress;
        existingBuyer.IsVerified = buyer.IsVerified;

        await _context.SaveChangesAsync();

        return Ok(existingBuyer);
    }

    [HttpGet("{id}/orders")]
    public async Task<IActionResult> GetBuyerOrders(string id)
    {
        var orders = await _context.Orders
            .Include(o => o.OrderItems)
            .Include(o => o.Payment)
            .Where(o => o.BuyerId == id)
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync();

        return Ok(orders);
    }

    [HttpGet("{id}/stats")]
    public async Task<IActionResult> GetBuyerStats(string id)
    {
        var buyer = await _context.Buyers.FindAsync(id);
        if (buyer == null)
            return NotFound();

        var totalOrders = await _context.Orders.CountAsync(o => o.BuyerId == id);
        var totalSpent = await _context.Orders
            .Where(o => o.BuyerId == id && o.Status == OrderStatus.Delivered)
            .SumAsync(o => o.TotalAmount);

        var pendingOrders = await _context.Orders
            .CountAsync(o => o.BuyerId == id && o.Status != OrderStatus.Delivered && o.Status != OrderStatus.Cancelled);

        return Ok(new
        {
            buyerId = id,
            totalOrders,
            totalSpent,
            pendingOrders,
            creditLimit = buyer.CreditLimit,
            outstandingBalance = buyer.OutstandingBalance,
            availableCredit = buyer.CreditLimit - buyer.OutstandingBalance
        });
    }
}
