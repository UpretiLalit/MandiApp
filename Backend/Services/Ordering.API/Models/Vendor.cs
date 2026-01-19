namespace Ordering.API.Models;

public class Vendor
{
    public string Id { get; set; } = string.Empty; // User ID from Identity service
    public string FullName { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string BusinessName { get; set; } = string.Empty;
    public string? GstNumber { get; set; }
    public string? FssaiLicense { get; set; }
    public string BusinessAddress { get; set; } = string.Empty;
    public string? Latitude { get; set; }
    public string? Longitude { get; set; }
    public bool IsVerified { get; set; } = false;
    public bool IsActive { get; set; } = true;
    public decimal CommissionRate { get; set; } = 0.03m; // 3% platform commission
    public decimal TotalEarnings { get; set; } = 0;
    public int TotalOrders { get; set; } = 0;
    public decimal Rating { get; set; } = 0;
    public int RatingCount { get; set; } = 0;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? LastActiveAt { get; set; }
    
    // Inventory & Products managed in Marketplace.API
    
    // Navigation
    public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
}
