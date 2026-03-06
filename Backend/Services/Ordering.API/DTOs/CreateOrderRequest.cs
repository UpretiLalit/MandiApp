namespace Ordering.API.DTOs;

public class CreateOrderRequest
{
    public List<OrderItemDto> Items { get; set; } = new();
    public string DeliveryAddress { get; set; } = string.Empty;
    
    // Phase 1: Total Landing Cost Breakdown
    public decimal ProduceTotal { get; set; }
    public decimal LogisticsFee { get; set; }
    public decimal ServiceFee { get; set; }
    public decimal TotalLandingCost { get; set; }
    
    // Escrow Payment
    public string PaymentMethod { get; set; } = "Escrow";
    public bool IsEscrow { get; set; } = true;
}

public record OrderItemDto
{
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string VendorId { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
}

public class UpdateStatusRequest
{
    public string Status { get; set; } = string.Empty;
}

public class CompletePaymentRequest
{
    public List<OrderItemDto> Items { get; set; } = new();
    public string DeliveryAddress { get; set; } = string.Empty;
    public decimal ProduceTotal { get; set; }
    public decimal LogisticsFee { get; set; }
    public decimal ServiceFee { get; set; }
    public decimal TotalLandingCost { get; set; }
    public string PaymentMethod { get; set; } = "UPI";
    public bool IsEscrow { get; set; } = false;
    
    // Razorpay Payment Details
    public string PaymentId { get; set; } = string.Empty;
    public string RazorpayOrderId { get; set; } = string.Empty;
    public string RazorpaySignature { get; set; } = string.Empty;
    public string PaymentStatus { get; set; } = string.Empty;
}

public class AddToCartRequest
{
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string VendorId { get; set; } = string.Empty;
    public string? VendorName { get; set; }
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public string? Unit { get; set; }
    public string? Grade { get; set; }
}