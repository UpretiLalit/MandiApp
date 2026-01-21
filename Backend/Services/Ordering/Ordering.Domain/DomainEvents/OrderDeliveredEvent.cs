using Ordering.Domain.Common;

namespace Ordering.Domain.DomainEvents;

/// <summary>
/// Domain event raised when an order is delivered
/// </summary>
public class OrderDeliveredEvent : IDomainEvent
{
    public Guid OrderId { get; }
    public Guid BuyerId { get; }
    public Guid TransporterId { get; }
    public DateTime OccurredOn { get; }

    public OrderDeliveredEvent(Guid orderId, Guid buyerId, Guid transporterId)
    {
        OrderId = orderId;
        BuyerId = buyerId;
        TransporterId = transporterId;
        OccurredOn = DateTime.UtcNow;
    }
}
