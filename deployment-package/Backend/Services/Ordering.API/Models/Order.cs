namespace Ordering.API.Models;

public class Order
{
    public int Id { get; set; }
    public string BuyerId { get; set; } = string.Empty;
    public string OrderNumber { get; set; } = string.Empty;
    
    // Phase 1: Total Landing Cost Breakdown
    public decimal ProduceTotal { get; set; }
    public decimal LogisticsFee { get; set; }
    public decimal ServiceFee { get; set; }
    public decimal TotalAmount { get; set; }
    
    public OrderStatus Status { get; set; } = OrderStatus.Pending;
    public string? DeliveryAddress { get; set; }
    public string? PickupAddress { get; set; }
    public string? TransporterId { get; set; }
    public string? TransporterName { get; set; }
    public string? BuyerName { get; set; }
    public string? VendorName { get; set; }
    public string? MandiId { get; set; }
    public DateTime? AssignedAt { get; set; }
    
    // Phase 1: Escrow Payment
    public bool IsEscrow { get; set; } = true;
    public EscrowStatus EscrowStatus { get; set; } = EscrowStatus.Held;
    
    // Payment Gateway Details
    public string? PaymentMethod { get; set; }
    public string? PaymentId { get; set; } // Razorpay payment_id
    public string? RazorpayOrderId { get; set; } // Razorpay order_id
    
    // Phase 3: Delivery Confirmation
    public string? DeliveryQRCode { get; set; }
    public DateTime? DeliveryConfirmedAt { get; set; }
    public string? DeliveryConfirmedBy { get; set; } // Buyer who confirmed
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? CompletedAt { get; set; }
    public DateTime? VendorsNotifiedAt { get; set; }

    // Navigation
    public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
    public Payment? Payment { get; set; }
}

public enum OrderStatus
{
    Pending,
    PaymentReceived,
    VendorsNotified,
    Processing,
    ReadyForDispatch,
    InTransit,
    Delivered,
    Cancelled
}

public enum EscrowStatus
{
    Held,
    Released,
    Refunded
}
