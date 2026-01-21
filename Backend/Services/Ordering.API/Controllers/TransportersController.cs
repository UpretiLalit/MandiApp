using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Ordering.API.Models;
using Ordering.API.Services;

namespace Ordering.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TransportersController : ControllerBase
{
    private readonly ITransporterService _transporterService;
    private readonly ILogger<TransportersController> _logger;

    public TransportersController(ITransporterService transporterService, ILogger<TransportersController> logger)
    {
        _transporterService = transporterService;
        _logger = logger;
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetTransporter(string id)
    {
        var transporter = await _transporterService.GetByIdAsync(id);
        if (transporter == null)
            return NotFound(new { message = "Transporter not found" });

        return Ok(transporter);
    }

    [HttpGet]
    public async Task<IActionResult> GetAllTransporters([FromQuery] bool availableOnly = false)
    {
        var transporters = availableOnly 
            ? await _transporterService.GetAvailableAsync()
            : await _transporterService.GetAllAsync();

        return Ok(transporters);
    }

    [HttpPost]
    public async Task<IActionResult> CreateTransporter([FromBody] Transporter transporter)
    {
        var created = await _transporterService.CreateAsync(transporter);
        _logger.LogInformation($"Transporter created: {created.Id} - {created.FullName}");
        return CreatedAtAction(nameof(GetTransporter), new { id = created.Id }, created);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateTransporter(string id, [FromBody] Transporter transporter)
    {
        if (id != transporter.Id)
            return BadRequest(new { message = "ID mismatch" });

        var updated = await _transporterService.UpdateAsync(id, transporter);
        if (updated == null)
            return NotFound(new { message = "Transporter not found" });

        return Ok(updated);
    }

    [HttpPost("{id}/update-location")]
    public async Task<IActionResult> UpdateLocation(string id, [FromBody] LocationUpdate location)
    {
        var success = await _transporterService.UpdateLocationAsync(id, 
            double.Parse(location.Latitude), 
            double.Parse(location.Longitude));

        if (!success)
            return NotFound();

        _logger.LogInformation($"Transporter location updated: {id} - ({location.Latitude}, {location.Longitude})");
        return Ok(new { message = "Location updated" });
    }

    [HttpPost("{id}/toggle-availability")]
    public async Task<IActionResult> ToggleAvailability(string id)
    {
        var success = await _transporterService.ToggleAvailabilityAsync(id);
        if (!success)
            return NotFound();

        return Ok(new { message = "Availability toggled" });
    }

    [HttpGet("{id}/deliveries")]
    public async Task<IActionResult> GetTransporterDeliveries(string id)
    {
        var deliveries = await _transporterService.GetDeliveriesAsync(id);
        return Ok(deliveries);
    }

    [HttpGet("{id}/stats")]
    public async Task<IActionResult> GetTransporterStats(string id)
    {
        var stats = await _transporterService.GetStatsAsync(id);
        return Ok(stats);
    }

    [HttpGet("nearby")]
    public async Task<IActionResult> GetNearbyTransporters(
        [FromQuery] double latitude, 
        [FromQuery] double longitude,
        [FromQuery] double radius = 10)
    {
        var transporters = await _transporterService.GetNearbyAsync(latitude, longitude, radius);
        return Ok(transporters);
    }
}

public record TransporterLocationUpdate(string Latitude, string Longitude);
