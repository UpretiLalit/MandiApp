using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Ordering.API.Models;
using Ordering.API.Services;

namespace Ordering.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class VendorsController : ControllerBase
{
    private readonly IVendorService _vendorService;
    private readonly ILogger<VendorsController> _logger;

    public VendorsController(IVendorService vendorService, ILogger<VendorsController> logger)
    {
        _vendorService = vendorService;
        _logger = logger;
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetVendor(string id)
    {
        var vendor = await _vendorService.GetByIdAsync(id);
        if (vendor == null)
            return NotFound(new { message = "Vendor not found" });

        return Ok(vendor);
    }

    [HttpGet]
    public async Task<IActionResult> GetAllVendors()
    {
        var vendors = await _vendorService.GetAllAsync();
        return Ok(vendors);
    }

    [HttpPost]
    public async Task<IActionResult> CreateVendor([FromBody] Vendor vendor)
    {
        var created = await _vendorService.CreateAsync(vendor);
        _logger.LogInformation($"Vendor created: {created.Id} - {created.BusinessName}");
        return CreatedAtAction(nameof(GetVendor), new { id = created.Id }, created);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateVendor(string id, [FromBody] Vendor vendor)
    {
        if (id != vendor.Id)
            return BadRequest(new { message = "ID mismatch" });

        var updated = await _vendorService.UpdateAsync(id, vendor);
        if (updated == null)
            return NotFound(new { message = "Vendor not found" });

        return Ok(updated);
    }

    [HttpGet("{id}/orders")]
    public async Task<IActionResult> GetVendorOrders(string id)
    {
        var orders = await _vendorService.GetOrdersAsync(id);
        return Ok(orders);
    }

    [HttpGet("{id}/stats")]
    public async Task<IActionResult> GetVendorStats(string id)
    {
        var stats = await _vendorService.GetStatsAsync(id);
        return Ok(stats);
    }

    [HttpPost("{id}/update-location")]
    public async Task<IActionResult> UpdateLocation(string id, [FromBody] LocationUpdate location)
    {
        var success = await _vendorService.UpdateLocationAsync(id, 
            double.Parse(location.Latitude), 
            double.Parse(location.Longitude));

        if (!success)
            return NotFound();

        return Ok(new { message = "Location updated" });
    }
}

public record LocationUpdate(string Latitude, string Longitude);
