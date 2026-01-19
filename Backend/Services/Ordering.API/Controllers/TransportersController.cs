using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Ordering.API.Data;
using Ordering.API.Models;

namespace Ordering.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TransportersController : ControllerBase
{
    private readonly OrderingDbContext _context;
    private readonly ILogger<TransportersController> _logger;

    public TransportersController(OrderingDbContext context, ILogger<TransportersController> logger)
    {
        _context = context;
        _logger = logger;
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetTransporter(string id)
    {
        var transporter = await _context.Transporters
            .Include(t => t.AssignedOrders)
            .FirstOrDefaultAsync(t => t.Id == id);

        if (transporter == null)
            return NotFound(new { message = "Transporter not found" });

        return Ok(transporter);
    }

    [HttpGet]
    public async Task<IActionResult> GetAllTransporters([FromQuery] bool availableOnly = false)
    {
        var query = _context.Transporters.AsQueryable();

        if (availableOnly)
            query = query.Where(t => t.IsAvailable && t.IsVerified);

        var transporters = await query
            .OrderByDescending(t => t.Rating)
            .ThenByDescending(t => t.TotalDeliveries)
            .ToListAsync();

        return Ok(transporters);
    }

    [HttpPost]
    public async Task<IActionResult> CreateTransporter([FromBody] Transporter transporter)
    {
        var existingTransporter = await _context.Transporters.FindAsync(transporter.Id);
        if (existingTransporter != null)
            return BadRequest(new { message = "Transporter already exists" });

        transporter.CreatedAt = DateTime.UtcNow;
        transporter.LastActiveAt = DateTime.UtcNow;
        _context.Transporters.Add(transporter);
        await _context.SaveChangesAsync();

        _logger.LogInformation($"Transporter created: {transporter.Id} - {transporter.FullName}");

        return CreatedAtAction(nameof(GetTransporter), new { id = transporter.Id }, transporter);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateTransporter(string id, [FromBody] Transporter transporter)
    {
        if (id != transporter.Id)
            return BadRequest(new { message = "ID mismatch" });

        var existingTransporter = await _context.Transporters.FindAsync(id);
        if (existingTransporter == null)
            return NotFound(new { message = "Transporter not found" });

        existingTransporter.FullName = transporter.FullName;
        existingTransporter.Email = transporter.Email;
        existingTransporter.VehicleNumber = transporter.VehicleNumber;
        existingTransporter.VehicleType = transporter.VehicleType;
        existingTransporter.DrivingLicense = transporter.DrivingLicense;
        existingTransporter.VehicleRC = transporter.VehicleRC;
        existingTransporter.IsVerified = transporter.IsVerified;

        await _context.SaveChangesAsync();

        return Ok(existingTransporter);
    }

    [HttpPost("{id}/update-location")]
    public async Task<IActionResult> UpdateLocation(string id, [FromBody] LocationUpdate location)
    {
        var transporter = await _context.Transporters.FindAsync(id);
        if (transporter == null)
            return NotFound();

        transporter.CurrentLatitude = location.Latitude;
        transporter.CurrentLongitude = location.Longitude;
        transporter.LastLocationUpdateAt = DateTime.UtcNow;
        transporter.LastActiveAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        _logger.LogInformation($"Transporter location updated: {id} - ({location.Latitude}, {location.Longitude})");

        return Ok(new { message = "Location updated" });
    }

    [HttpPost("{id}/toggle-availability")]
    public async Task<IActionResult> ToggleAvailability(string id)
    {
        var transporter = await _context.Transporters.FindAsync(id);
        if (transporter == null)
            return NotFound();

        transporter.IsAvailable = !transporter.IsAvailable;
        transporter.LastActiveAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return Ok(new { 
            message = $"Availability set to {transporter.IsAvailable}",
            isAvailable = transporter.IsAvailable 
        });
    }

    [HttpGet("{id}/deliveries")]
    public async Task<IActionResult> GetTransporterDeliveries(string id)
    {
        var orders = await _context.Orders
            .Include(o => o.OrderItems)
            .Include(o => o.Payment)
            .Where(o => o.TransporterId == id)
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync();

        return Ok(orders);
    }

    [HttpGet("{id}/stats")]
    public async Task<IActionResult> GetTransporterStats(string id)
    {
        var transporter = await _context.Transporters.FindAsync(id);
        if (transporter == null)
            return NotFound();

        var activeDeliveries = await _context.Orders
            .CountAsync(o => o.TransporterId == id && o.Status == OrderStatus.InTransit);

        var todayDeliveries = await _context.Orders
            .CountAsync(o => o.TransporterId == id && 
                           o.Status == OrderStatus.Delivered && 
                           o.CompletedAt.HasValue && 
                           o.CompletedAt.Value.Date == DateTime.UtcNow.Date);

        var todayEarnings = await _context.Orders
            .Where(o => o.TransporterId == id && 
                       o.Status == OrderStatus.Delivered && 
                       o.CompletedAt.HasValue && 
                       o.CompletedAt.Value.Date == DateTime.UtcNow.Date)
            .SumAsync(o => o.LogisticsFee);

        return Ok(new
        {
            transporterId = id,
            fullName = transporter.FullName,
            vehicleNumber = transporter.VehicleNumber,
            vehicleType = transporter.VehicleType.ToString(),
            totalDeliveries = transporter.TotalDeliveries,
            totalEarnings = transporter.TotalEarnings,
            activeDeliveries,
            todayDeliveries,
            todayEarnings,
            rating = transporter.Rating,
            ratingCount = transporter.RatingCount,
            isAvailable = transporter.IsAvailable,
            isVerified = transporter.IsVerified
        });
    }

    [HttpGet("nearby")]
    public async Task<IActionResult> GetNearbyTransporters([FromQuery] string latitude, [FromQuery] string longitude)
    {
        // TODO: Implement actual geolocation query
        // For now, return all available transporters
        var transporters = await _context.Transporters
            .Where(t => t.IsAvailable && t.IsVerified)
            .OrderByDescending(t => t.Rating)
            .ToListAsync();

        return Ok(transporters);
    }
}

public record TransporterLocationUpdate(string Latitude, string Longitude);
