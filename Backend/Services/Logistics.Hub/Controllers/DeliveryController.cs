using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Logistics.Hub.Services;
using Logistics.Hub.Models;
using Logistics.Hub.DTOs;

namespace Logistics.Hub.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DeliveryController : ControllerBase
{
    private readonly IDeliveryService _deliveryService;
    private readonly ITrackingService _trackingService;

    public DeliveryController(IDeliveryService deliveryService, ITrackingService trackingService)
    {
        _deliveryService = deliveryService;
        _trackingService = trackingService;
    }

    [HttpPost]
    [Authorize(Roles = "Vendor")]
    public async Task<IActionResult> CreateDelivery([FromBody] CreateDeliveryRequest request)
    {
        var delivery = await _deliveryService.CreateDeliveryAsync(request);
        return Ok(delivery);
    }

    [HttpGet("order/{orderId}")]
    public async Task<IActionResult> GetDeliveryByOrderId(int orderId)
    {
        var delivery = await _deliveryService.GetDeliveryByOrderIdAsync(orderId);
        if (delivery == null)
            return NotFound();

        return Ok(delivery);
    }

    [HttpGet("my-deliveries")]
    [Authorize(Roles = "Transporter")]
    public async Task<IActionResult> GetMyDeliveries()
    {
        var transporterId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (transporterId == null)
            return Unauthorized();

        var deliveries = await _deliveryService.GetTransporterDeliveriesAsync(transporterId);
        return Ok(deliveries);
    }

    [HttpPut("{id}/status")]
    [Authorize(Roles = "Transporter")]
    public async Task<IActionResult> UpdateDeliveryStatus(int id, [FromQuery] string status)
    {
        if (!Enum.TryParse<DeliveryStatus>(status, out var deliveryStatus))
            return BadRequest(new { message = "Invalid status" });

        var success = await _deliveryService.UpdateDeliveryStatusAsync(id, deliveryStatus);
        if (!success)
            return NotFound();

        return Ok(new { message = "Delivery status updated" });
    }

    [HttpPost("confirm-delivery")]
    [Authorize(Roles = "Transporter")]
    public async Task<IActionResult> ConfirmDelivery([FromBody] QrConfirmationRequest request)
    {
        var success = await _deliveryService.ConfirmDeliveryByQrAsync(request.DeliveryId, request.QrCode);
        if (!success)
            return BadRequest(new { message = "Invalid QR code or delivery not found" });

        return Ok(new { message = "Delivery confirmed successfully" });
    }

    [HttpGet("{deliveryId}/tracking-history")]
    public async Task<IActionResult> GetTrackingHistory(int deliveryId)
    {
        var history = await _trackingService.GetLocationHistoryAsync(deliveryId);
        return Ok(history);
    }
}
