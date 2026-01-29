namespace Ordering.API.Models;

public class Buyer
{
    public string Id { get; set; } = string.Empty; // User ID from Identity service
    public string FullName { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? CompanyName { get; set; }
    public string? GstNumber { get; set; }
    public string BusinessAddress { get; set; } = string.Empty;
    public string DeliveryAddress { get; set; } = string.Empty;
    public decimal CreditLimit { get; set; } = 0; // Optional credit system
    public decimal OutstandingBalance { get; set; } = 0;
    public bool IsVerified { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? LastOrderAt { get; set; }
    
    // Navigation
    public ICollection<Order> Orders { get; set; } = new List<Order>();
}
