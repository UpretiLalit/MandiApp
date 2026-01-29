namespace Logistics.Hub.Models;

public class LocationTracking
{
    public int Id { get; set; }
    public int DeliveryId { get; set; }
    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    public double? Speed { get; set; }
    public double? Accuracy { get; set; }

    // Navigation
    public Delivery Delivery { get; set; } = null!;
}
