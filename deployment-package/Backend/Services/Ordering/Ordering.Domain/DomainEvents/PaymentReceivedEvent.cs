using Ordering.Domain.Common;
using Ordering.Domain.ValueObjects;

namespace Ordering.Domain.DomainEvents;

/// <summary>
/// Domain event raised when payment is received for an order
/// </summary>
public class PaymentReceivedEvent : IDomainEvent
{
    public Guid OrderId { get; }
    public Money Amount { get; }
    public DateTime OccurredOn { get; }

    public PaymentReceivedEvent(Guid orderId, Money amount)
    {
        OrderId = orderId;
        Amount = amount;
        OccurredOn = DateTime.UtcNow;
    }
}
