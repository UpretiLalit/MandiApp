using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.Authorization;
using Logistics.Hub.Services;
using Logistics.Hub.DTOs;

namespace Logistics.Hub.Hubs;

[Authorize]
public class TrackingHub : Hub
{
    private readonly ITrackingService _trackingService;
    private readonly ILogger<TrackingHub> _logger;

    public TrackingHub(ITrackingService trackingService, ILogger<TrackingHub> logger)
    {
        _trackingService = trackingService;
        _logger = logger;
    }

    public override async Task OnConnectedAsync()
    {
        var userId = Context.User?.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        var role = Context.User?.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;

        if (userId != null)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, $"User-{userId}");
            _logger.LogInformation($"User {userId} ({role}) connected to tracking hub");
        }

        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var userId = Context.User?.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

        if (userId != null)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"User-{userId}");
            _logger.LogInformation($"User {userId} disconnected from tracking hub");
        }

        await base.OnDisconnectedAsync(exception);
    }

    // Transporter sends location updates
    [Authorize(Roles = "Transporter")]
    public async Task UpdateLocation(LocationUpdateRequest request)
    {
        var transporterId = Context.User?.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (transporterId == null)
            return;

        await _trackingService.UpdateLocationAsync(request.DeliveryId, transporterId, request.Latitude, request.Longitude, request.Speed, request.Accuracy);

        // Broadcast to buyer tracking this delivery
        var delivery = await _trackingService.GetDeliveryAsync(request.DeliveryId);
        if (delivery != null)
        {
            await Clients.Group($"User-{delivery.BuyerId}").SendAsync("LocationUpdate", new
            {
                request.DeliveryId,
                request.Latitude,
                request.Longitude,
                request.Speed,
                Timestamp = DateTime.UtcNow
            });
        }
    }

    // Buyer subscribes to delivery tracking
    [Authorize(Roles = "Buyer")]
    public async Task SubscribeToDelivery(int deliveryId)
    {
        var buyerId = Context.User?.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (buyerId == null)
            return;

        var delivery = await _trackingService.GetDeliveryAsync(deliveryId);
        if (delivery != null && delivery.BuyerId == buyerId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, $"Delivery-{deliveryId}");
            _logger.LogInformation($"Buyer {buyerId} subscribed to delivery {deliveryId}");
        }
    }

    // Buyer unsubscribes from delivery tracking
    [Authorize(Roles = "Buyer")]
    public async Task UnsubscribeFromDelivery(int deliveryId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"Delivery-{deliveryId}");
    }
}
