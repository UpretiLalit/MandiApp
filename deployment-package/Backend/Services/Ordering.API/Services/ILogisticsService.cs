using Ordering.API.Models;

namespace Ordering.API.Services;

public class MandiHeatmapDto
{
    public string MandiId { get; set; } = string.Empty;
    public string MandiName { get; set; } = string.Empty;
    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public int ActiveOrders { get; set; }
    public int AvailableTransporters { get; set; }
    public double DemandScore { get; set; }
    public string Color { get; set; } = string.Empty;
}

public class StuckOrderDto
{
    public string OrderId { get; set; } = string.Empty;
    public string OrderNumber { get; set; } = string.Empty;
    public string BuyerName { get; set; } = string.Empty;
    public string VendorName { get; set; } = string.Empty;
    public string TransporterName { get; set; } = string.Empty;
    public string TransporterId { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime AssignedAt { get; set; }
    public int StuckDuration { get; set; }
    public string PickupLocation { get; set; } = string.Empty;
    public string DeliveryLocation { get; set; } = string.Empty;
    public bool IsMoving { get; set; }
}

public class AvailableTransporterDto
{
    public string Id { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string? VehicleType { get; set; }
    public string? VehicleNumber { get; set; }
    public string? CurrentLatitude { get; set; }
    public string? CurrentLongitude { get; set; }
    public string? Status { get; set; }
    public int ActiveDeliveries { get; set; }
}

public interface ILogisticsService
{
    Task<IEnumerable<MandiHeatmapDto>> GetMandiHeatmapAsync();
    Task<IEnumerable<StuckOrderDto>> GetStuckOrdersAsync(int thresholdMinutes);
    Task<IEnumerable<AvailableTransporterDto>> GetAvailableTransportersAsync(string? mandiId);
    Task<bool> ReassignOrderAsync(int orderId, string newTransporterId);
    Task<bool> FlagStuckOrderAsync(int orderId);
}
