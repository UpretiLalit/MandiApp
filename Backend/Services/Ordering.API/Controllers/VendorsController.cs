using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Ordering.API.Data;
using Ordering.API.Models;

namespace Ordering.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class VendorsController : ControllerBase
{
    private readonly OrderingDbContext _context;
    private readonly ILogger<VendorsController> _logger;

    public VendorsController(OrderingDbContext context, ILogger<VendorsController> logger)
    {
        _context = context;
        _logger = logger;
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetVendor(string id)
    {
        var vendor = await _context.Vendors
            .Include(v => v.OrderItems)
            .FirstOrDefaultAsync(v => v.Id == id);

        if (vendor == null)
            return NotFound(new { message = "Vendor not found" });

        return Ok(vendor);
    }

    [HttpGet]
    public async Task<IActionResult> GetAllVendors([FromQuery] bool activeOnly = true)
    {
        var query = _context.Vendors.AsQueryable();

        if (activeOnly)
            query = query.Where(v => v.IsActive && v.IsVerified);

        var vendors = await query
            .OrderByDescending(v => v.Rating)
            .ThenByDescending(v => v.TotalOrders)
            .ToListAsync();

        return Ok(vendors);
    }

    [HttpPost]
    public async Task<IActionResult> CreateVendor([FromBody] Vendor vendor)
    {
        var existingVendor = await _context.Vendors.FindAsync(vendor.Id);
        if (existingVendor != null)
            return BadRequest(new { message = "Vendor already exists" });

        vendor.CreatedAt = DateTime.UtcNow;
        vendor.LastActiveAt = DateTime.UtcNow;
        _context.Vendors.Add(vendor);
        await _context.SaveChangesAsync();

        _logger.LogInformation($"Vendor created: {vendor.Id} - {vendor.BusinessName}");

        return CreatedAtAction(nameof(GetVendor), new { id = vendor.Id }, vendor);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateVendor(string id, [FromBody] Vendor vendor)
    {
        if (id != vendor.Id)
            return BadRequest(new { message = "ID mismatch" });

        var existingVendor = await _context.Vendors.FindAsync(id);
        if (existingVendor == null)
            return NotFound(new { message = "Vendor not found" });

        existingVendor.FullName = vendor.FullName;
        existingVendor.Email = vendor.Email;
        existingVendor.BusinessName = vendor.BusinessName;
        existingVendor.GstNumber = vendor.GstNumber;
        existingVendor.FssaiLicense = vendor.FssaiLicense;
        existingVendor.BusinessAddress = vendor.BusinessAddress;
        existingVendor.Latitude = vendor.Latitude;
        existingVendor.Longitude = vendor.Longitude;
        existingVendor.IsActive = vendor.IsActive;
        existingVendor.IsVerified = vendor.IsVerified;

        await _context.SaveChangesAsync();

        return Ok(existingVendor);
    }

    [HttpGet("{id}/orders")]
    public async Task<IActionResult> GetVendorOrders(string id)
    {
        var orders = await _context.Orders
            .Include(o => o.OrderItems.Where(oi => oi.VendorId == id))
            .Where(o => o.OrderItems.Any(oi => oi.VendorId == id))
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync();

        return Ok(orders);
    }

    [HttpGet("{id}/stats")]
    public async Task<IActionResult> GetVendorStats(string id)
    {
        var vendor = await _context.Vendors.FindAsync(id);
        if (vendor == null)
            return NotFound();

        var totalItems = await _context.OrderItems
            .Where(oi => oi.VendorId == id)
            .CountAsync();

        var totalRevenue = await _context.OrderItems
            .Include(oi => oi.Order)
            .Where(oi => oi.VendorId == id && oi.Order.Status == OrderStatus.Delivered)
            .SumAsync(oi => oi.TotalPrice);

        var pendingOrders = await _context.OrderItems
            .Include(oi => oi.Order)
            .Where(oi => oi.VendorId == id && !oi.IsPickedUp && oi.Order.Status != OrderStatus.Cancelled)
            .CountAsync();

        return Ok(new
        {
            vendorId = id,
            businessName = vendor.BusinessName,
            totalOrders = vendor.TotalOrders,
            totalItems,
            totalRevenue,
            totalEarnings = vendor.TotalEarnings,
            pendingOrders,
            rating = vendor.Rating,
            ratingCount = vendor.RatingCount,
            isActive = vendor.IsActive,
            isVerified = vendor.IsVerified
        });
    }

    [HttpPost("{id}/update-location")]
    public async Task<IActionResult> UpdateLocation(string id, [FromBody] LocationUpdate location)
    {
        var vendor = await _context.Vendors.FindAsync(id);
        if (vendor == null)
            return NotFound();

        vendor.Latitude = location.Latitude;
        vendor.Longitude = location.Longitude;
        vendor.LastActiveAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return Ok(new { message = "Location updated" });
    }
}

public record LocationUpdate(string Latitude, string Longitude);
