namespace Ordering.API.Models;

public class Payment
{
    public int Id { get; set; }
    public int OrderId { get; set; }
    public string TransactionId { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public PaymentStatus Status { get; set; } = PaymentStatus.Pending;
    public PaymentMethod Method { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? CompletedAt { get; set; }
    public bool IsEscrow { get; set; } = true; // Funds held until delivery confirmed
    
    // Phase 3: Escrow Release & Automated Payout
    public DateTime? EscrowReleasedAt { get; set; }
    public bool VendorsPaid { get; set; } = false;
    public bool TransporterPaid { get; set; } = false;
    public bool PlatformPaid { get; set; } = false;
    
    // Payout breakdown
    public decimal VendorPayout { get; set; }
    public decimal TransporterPayout { get; set; }
    public decimal PlatformCommission { get; set; }

    // Navigation
    public Order Order { get; set; } = null!;
}

public enum PaymentStatus
{
    Pending,
    Authorized,
    Captured,
    Failed,
    Refunded,
    EscrowReleased
}

public enum PaymentMethod
{
    UPI,
    Card,
    NetBanking,
    Wallet
}
