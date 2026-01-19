using Ordering.API.Models;

namespace Ordering.API.Services;

public interface IPaymentService
{
    Task<string> InitiatePaymentAsync(int orderId, decimal amount);
    Task<bool> CapturePaymentAsync(string transactionId);
    Task<bool> RefundPaymentAsync(int orderId);
    Task<bool> ReleaseEscrowAsync(int orderId);
}
