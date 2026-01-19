namespace Ordering.API.Models;

public class Transporter
{
    public string Id { get; set; } = string.Empty; // User ID from Identity service
    public string FullName { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string VehicleNumber { get; set; } = string.Empty;
    public VehicleType VehicleType { get; set; } = VehicleType.TwoWheeler;
    public string? DrivingLicense { get; set; }
    public string? VehicleRC { get; set; }
    public bool IsVerified { get; set; } = false;
    public bool IsAvailable { get; set; } = true;
    public string? CurrentLatitude { get; set; }
    public string? CurrentLongitude { get; set; }
    public DateTime? LastLocationUpdateAt { get; set; }
    public decimal TotalEarnings { get; set; } = 0;
    public int TotalDeliveries { get; set; } = 0;
    public decimal Rating { get; set; } = 0;
    public int RatingCount { get; set; } = 0;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? LastActiveAt { get; set; }
    
    // Navigation
    public ICollection<Order> AssignedOrders { get; set; } = new List<Order>();
}

public enum VehicleType
{
    TwoWheeler,
    ThreeWheeler,
    FourWheeler,
    Truck
}
