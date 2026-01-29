using Ordering.Domain.Common;

namespace Ordering.Domain.DomainEvents;

/// <summary>
/// Domain event raised when an order is created
/// </summary>
public class OrderCreatedEvent : IDomainEvent
{
    public Guid OrderId { get; }
    public Guid BuyerId { get; }
    public string OrderNumber { get; }
    public DateTime OccurredOn { get; }

    public OrderCreatedEvent(Guid orderId, Guid buyerId, string orderNumber)
    {
        OrderId = orderId;
        BuyerId = buyerId;
        OrderNumber = orderNumber;
        OccurredOn = DateTime.UtcNow;
    }
}
