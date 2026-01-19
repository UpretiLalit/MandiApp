using Microsoft.EntityFrameworkCore;
using Ordering.API.Data;
using Ordering.API.Models;

namespace Ordering.API.Services;

public class PaymentService : IPaymentService
{
    private readonly OrderingDbContext _context;
    private readonly IConfiguration _configuration;
    private readonly ILogger<PaymentService> _logger;

    public PaymentService(OrderingDbContext context, IConfiguration configuration, ILogger<PaymentService> logger)
    {
        _context = context;
        _configuration = configuration;
        _logger = logger;
    }

    public async Task<string> InitiatePaymentAsync(int orderId, decimal amount)
    {
        var order = await _context.Orders.FindAsync(orderId);
        if (order == null)
            throw new Exception("Order not found");

        // TODO: Integrate with Razorpay/Stripe API
        var transactionId = $"TXN-{DateTime.UtcNow:yyyyMMddHHmmss}-{Guid.NewGuid().ToString("N").Substring(0, 8).ToUpper()}";

        var payment = new Payment
        {
            OrderId = orderId,
            TransactionId = transactionId,
            Amount = amount,
            Status = PaymentStatus.Pending,
            Method = PaymentMethod.UPI,
            IsEscrow = true
        };

        _context.Payments.Add(payment);
        await _context.SaveChangesAsync();

        _logger.LogInformation($"Payment initiated for Order {orderId} with transaction ID {transactionId}");

        return transactionId;
    }

    public async Task<bool> CapturePaymentAsync(string transactionId)
    {
        var payment = await _context.Payments.FirstOrDefaultAsync(p => p.TransactionId == transactionId);
        if (payment == null)
            return false;

        // TODO: Call Razorpay/Stripe capture API
        payment.Status = PaymentStatus.Captured;
        payment.CompletedAt = DateTime.UtcNow;

        var order = await _context.Orders.FindAsync(payment.OrderId);
        if (order != null)
            order.Status = OrderStatus.PaymentReceived;

        await _context.SaveChangesAsync();

        _logger.LogInformation($"Payment captured for transaction {transactionId}");

        return true;
    }

    public async Task<bool> RefundPaymentAsync(int orderId)
    {
        var payment = await _context.Payments.FirstOrDefaultAsync(p => p.OrderId == orderId);
        if (payment == null || payment.Status != PaymentStatus.Captured)
            return false;

        // TODO: Call Razorpay/Stripe refund API
        payment.Status = PaymentStatus.Refunded;

        var order = await _context.Orders.FindAsync(orderId);
        if (order != null)
            order.Status = OrderStatus.Cancelled;

        await _context.SaveChangesAsync();

        _logger.LogInformation($"Payment refunded for order {orderId}");

        return true;
    }    
    // Phase 3: Release escrow and distribute payments
    public async Task<bool> ReleaseEscrowAsync(int orderId)
    {
        var order = await _context.Orders
            .Include(o => o.Payment)
            .Include(o => o.OrderItems)
            .FirstOrDefaultAsync(o => o.Id == orderId);
            
        if (order == null || order.Payment == null)
            return false;
            
        if (!order.IsEscrow || order.EscrowStatus != EscrowStatus.Held)
        {
            _logger.LogWarning($"Order {orderId} escrow already released or not in escrow");
            return false;
        }
        
        // Calculate payouts
        var vendorPayout = order.ProduceTotal;
        var transporterPayout = order.LogisticsFee;
        var platformCommission = order.ServiceFee;
        
        // Update payment record
        order.Payment.EscrowReleasedAt = DateTime.UtcNow;
        order.Payment.Status = PaymentStatus.EscrowReleased;
        order.Payment.VendorPayout = vendorPayout;
        order.Payment.TransporterPayout = transporterPayout;
        order.Payment.PlatformCommission = platformCommission;
        
        // Update order escrow status
        order.EscrowStatus = EscrowStatus.Released;
        
        // Trigger individual payouts
        await ProcessVendorPayoutsAsync(order, vendorPayout);
        await ProcessTransporterPayoutAsync(order, transporterPayout);
        await ProcessPlatformPayoutAsync(order, platformCommission);
        
        await _context.SaveChangesAsync();
        
        _logger.LogInformation(
            $"[ESCROW RELEASED] Order {order.OrderNumber}: " +
            $"Vendors: ₹{vendorPayout}, Transporter: ₹{transporterPayout}, Platform: ₹{platformCommission}"
        );
        
        return true;
    }
    
    private async Task ProcessVendorPayoutsAsync(Order order, decimal totalVendorPayout)
    {
        var vendorGroups = order.OrderItems.GroupBy(oi => oi.VendorId);
        
        foreach (var vendorGroup in vendorGroups)
        {
            var vendorId = vendorGroup.Key;
            var vendorTotal = vendorGroup.Sum(oi => oi.TotalPrice);
            
            Console.WriteLine($"[VENDOR PAYOUT] {vendorId}: ₹{vendorTotal}");
        }
        
        order.Payment!.VendorsPaid = true;
        await Task.CompletedTask;
    }
    
    private async Task ProcessTransporterPayoutAsync(Order order, decimal transporterPayout)
    {
        if (string.IsNullOrEmpty(order.TransporterId))
            return;
        
        Console.WriteLine($"[TRANSPORTER PAYOUT] {order.TransporterId}: ₹{transporterPayout}");
        
        order.Payment!.TransporterPaid = true;
        await Task.CompletedTask;
    }
    
    private async Task ProcessPlatformPayoutAsync(Order order, decimal platformCommission)
    {
        Console.WriteLine($"[PLATFORM COMMISSION] Order {order.OrderNumber}: ₹{platformCommission}");
        
        order.Payment!.PlatformPaid = true;
        await Task.CompletedTask;
    }}
