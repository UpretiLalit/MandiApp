using Microsoft.AspNetCore.SignalR;

namespace Ordering.API.Hubs;

public class PriceHub : Hub
{
    private readonly ILogger<PriceHub> _logger;

    public PriceHub(ILogger<PriceHub> logger)
    {
        _logger = logger;
    }

    public override async Task OnConnectedAsync()
    {
        _logger.LogInformation($"Client connected: {Context.ConnectionId}");
        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        _logger.LogInformation($"Client disconnected: {Context.ConnectionId}");
        await base.OnDisconnectedAsync(exception);
    }

    // Called by vendors to broadcast price updates
    public async Task UpdatePrice(string productId, string vendorId, decimal newPrice)
    {
        _logger.LogInformation($"Price update: Product {productId}, Vendor {vendorId}, New Price: {newPrice}");
        
        // Broadcast to all connected clients
        await Clients.All.SendAsync("PriceUpdated", new
        {
            productId,
            vendorId,
            newPrice,
            timestamp = DateTime.UtcNow
        });
    }

    // Join a specific product room for targeted updates
    public async Task JoinProductRoom(string productId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, $"product_{productId}");
        _logger.LogInformation($"Client {Context.ConnectionId} joined product room: {productId}");
    }

    // Leave a product room
    public async Task LeaveProductRoom(string productId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"product_{productId}");
        _logger.LogInformation($"Client {Context.ConnectionId} left product room: {productId}");
    }

    // Send price update to specific product room
    public async Task UpdatePriceForProduct(string productId, string vendorId, decimal newPrice)
    {
        await Clients.Group($"product_{productId}").SendAsync("PriceUpdated", new
        {
            productId,
            vendorId,
            newPrice,
            timestamp = DateTime.UtcNow
        });
    }
}
