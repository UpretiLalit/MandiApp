namespace Ordering.API.Models;

public class OrderItem
{
    public int Id { get; set; }
    public int OrderId { get; set; }
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string VendorId { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal TotalPrice { get; set; }
    
    // Phase 2: Vendor Readiness
    public bool IsReadyForPickup { get; set; } = false;
    public DateTime? MarkedReadyAt { get; set; }
    public string? PickupQRCode { get; set; }
    public bool IsPickedUp { get; set; } = false;
    public DateTime? PickedUpAt { get; set; }

    // Navigation
    public Order Order { get; set; } = null!;
}
