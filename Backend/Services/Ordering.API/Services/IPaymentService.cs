using Ordering.API.Models;

namespace Ordering.API.Services;

public interface IPaymentService
{
    Task<PaymentInitiationResult?> InitiatePaymentAsync(int orderId);
    Task<bool> CapturePaymentAsync(string transactionId);
    Task<bool> RefundPaymentAsync(int orderId);
    Task<bool> ReleaseEscrowAsync(int orderId);
}

public class PaymentInitiationResult
{
    public string TransactionId { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string OrderNumber { get; set; } = string.Empty;
}
