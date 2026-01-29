using Microsoft.AspNetCore.SignalR;

namespace Ordering.API.Hubs;

public class TrackingHub : Hub
{
    private readonly ILogger<TrackingHub> _logger;

    public TrackingHub(ILogger<TrackingHub> logger)
    {
        _logger = logger;
    }

    public override async Task OnConnectedAsync()
    {
        _logger.LogInformation("Client connected: {ConnectionId}", Context.ConnectionId);
        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        _logger.LogInformation("Client disconnected: {ConnectionId}", Context.ConnectionId);
        await base.OnDisconnectedAsync(exception);
    }

    // Client can call this to update location
    public async Task UpdateLocation(string orderId, double latitude, double longitude)
    {
        _logger.LogInformation("Location update for order {OrderId}: {Lat}, {Lng}", orderId, latitude, longitude);
        
        // Broadcast to all clients monitoring logistics
        await Clients.All.SendAsync("OrderLocationUpdated", new
        {
            orderId,
            latitude,
            longitude,
            timestamp = DateTime.UtcNow
        });
    }

    // Client can call this to update transporter status
    public async Task UpdateTransporterStatus(string transporterId, bool isAvailable)
    {
        _logger.LogInformation("Transporter {TransporterId} status changed to {IsAvailable}", transporterId, isAvailable);
        
        await Clients.All.SendAsync("TransporterStatusChanged", new
        {
            transporterId,
            isAvailable,
            timestamp = DateTime.UtcNow
        });
    }
}
