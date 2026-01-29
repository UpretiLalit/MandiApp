namespace Ordering.Application.DTOs;

public class OrderDto
{
    public Guid Id { get; set; }
    public string OrderNumber { get; set; } = string.Empty;
    public Guid BuyerId { get; set; }
    public Guid? VendorId { get; set; }
    public Guid? TransporterId { get; set; }
    public string Status { get; set; } = string.Empty;
    public string BuyerPhone { get; set; } = string.Empty;
    
    // Address
    public string Street { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string State { get; set; } = string.Empty;
    public string Pincode { get; set; } = string.Empty;
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
    
    // Amounts
    public decimal TotalAmount { get; set; }
    public decimal LogisticsFee { get; set; }
    public decimal ServiceFee { get; set; }
    public decimal GrandTotal { get; set; }
    public string Currency { get; set; } = "INR";
    
    // Items
    public List<OrderItemDto> Items { get; set; } = new();
    
    // Timestamps
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public DateTime? ConfirmedAt { get; set; }
    public DateTime? DeliveredAt { get; set; }
    public string? CancellationReason { get; set; }
}
