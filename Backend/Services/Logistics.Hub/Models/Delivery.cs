namespace Logistics.Hub.Models;

public class Delivery
{
    public int Id { get; set; }
    public int OrderId { get; set; }
    public string TransporterId { get; set; } = string.Empty;
    public string BuyerId { get; set; } = string.Empty;
    public DeliveryStatus Status { get; set; } = DeliveryStatus.Assigned;
    public string PickupAddress { get; set; } = string.Empty;
    public string DeliveryAddress { get; set; } = string.Empty;
    public DateTime AssignedAt { get; set; } = DateTime.UtcNow;
    public DateTime? PickedUpAt { get; set; }
    public DateTime? DeliveredAt { get; set; }
    public string? QrCodeForDelivery { get; set; }

    // Navigation
    public ICollection<LocationTracking> LocationTrackings { get; set; } = new List<LocationTracking>();
}

public enum DeliveryStatus
{
    Assigned,
    PickedUp,
    InTransit,
    Delivered,
    Failed
}
