using Ordering.Domain.Common;
using Ordering.Domain.DomainEvents;
using Ordering.Domain.ValueObjects;

namespace Ordering.Domain.Aggregates.OrderAggregate;

/// <summary>
/// Order aggregate root.
/// Represents a buyer's order with items, delivery address, and payment information.
/// </summary>
public class Order : BaseEntity, IAggregateRoot
{
    private readonly List<OrderItem> _items = new();

    public Guid BuyerId { get; private set; }
    public Guid? VendorId { get; private set; }
    public Guid? TransporterId { get; private set; }
    public string OrderNumber { get; private set; } = string.Empty;
    public OrderStatus Status { get; private set; }
    public Address DeliveryAddress { get; private set; } = null!;
    public PhoneNumber BuyerPhone { get; private set; } = null!;
    public Money TotalAmount { get; private set; } = Money.Zero();
    public Money LogisticsFee { get; private set; } = Money.Zero();
    public Money ServiceFee { get; private set; } = Money.Zero();
    public Money GrandTotal { get; private set; } = Money.Zero();
    public DateTime? ConfirmedAt { get; private set; }
    public DateTime? DeliveredAt { get; private set; }
    public string? CancellationReason { get; private set; }

    public IReadOnlyCollection<OrderItem> Items => _items.AsReadOnly();

    private Order() : base() { } // For EF Core

    /// <summary>
    /// Factory method to create a new order
    /// </summary>
    public static Order Create(Guid buyerId, PhoneNumber buyerPhone, Address deliveryAddress)
    {
        var order = new Order
        {
            BuyerId = buyerId,
            BuyerPhone = buyerPhone,
            DeliveryAddress = deliveryAddress,
            Status = OrderStatus.Pending,
            OrderNumber = GenerateOrderNumber(),
            TotalAmount = Money.Zero(),
            LogisticsFee = Money.Zero(),
            ServiceFee = Money.Zero(),
            GrandTotal = Money.Zero()
        };

        order.AddDomainEvent(new OrderCreatedEvent(order.Id, order.BuyerId, order.OrderNumber));
        return order;
    }

    private static string GenerateOrderNumber()
    {
        return $"ORD-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString("N").Substring(0, 8).ToUpper()}";
    }

    /// <summary>
    /// Add an item to the order
    /// </summary>
    public void AddItem(Guid productId, string productName, Money unitPrice, int quantity)
    {
        if (Status != OrderStatus.Pending)
            throw new InvalidOperationException("Cannot add items to a non-pending order");

        var existingItem = _items.FirstOrDefault(i => i.ProductId == productId);

        if (existingItem != null)
        {
            existingItem.UpdateQuantity(existingItem.Quantity + quantity);
        }
        else
        {
            var newItem = OrderItem.Create(productId, productName, unitPrice, quantity);
            newItem.SetOrderId(Id);
            _items.Add(newItem);
        }

        RecalculateTotal();
        MarkAsUpdated();
    }

    /// <summary>
    /// Remove an item from the order
    /// </summary>
    public void RemoveItem(Guid productId)
    {
        if (Status != OrderStatus.Pending)
            throw new InvalidOperationException("Cannot remove items from a non-pending order");

        var item = _items.FirstOrDefault(i => i.ProductId == productId);
        if (item == null)
            throw new InvalidOperationException($"Item with product ID {productId} not found in order");

        _items.Remove(item);
        RecalculateTotal();
        MarkAsUpdated();
    }

    /// <summary>
    /// Update quantity of an existing item
    /// </summary>
    public void UpdateItemQuantity(Guid productId, int newQuantity)
    {
        if (Status != OrderStatus.Pending)
            throw new InvalidOperationException("Cannot update items in a non-pending order");

        var item = _items.FirstOrDefault(i => i.ProductId == productId);
        if (item == null)
            throw new InvalidOperationException($"Item with product ID {productId} not found in order");

        item.UpdateQuantity(newQuantity);
        RecalculateTotal();
        MarkAsUpdated();
    }

    /// <summary>
    /// Set fees (logistics and service) - usually calculated by domain service
    /// </summary>
    public void SetFees(Money logisticsFee, Money serviceFee)
    {
        LogisticsFee = logisticsFee;
        ServiceFee = serviceFee;
        RecalculateTotal();
        MarkAsUpdated();
    }

    /// <summary>
    /// Confirm the order (payment received)
    /// </summary>
    public void Confirm()
    {
        if (Status != OrderStatus.Pending)
            throw new InvalidOperationException($"Cannot confirm order with status {Status}");

        if (!_items.Any())
            throw new InvalidOperationException("Cannot confirm order without items");

        Status = OrderStatus.Confirmed;
        ConfirmedAt = DateTime.UtcNow;
        MarkAsUpdated();

        AddDomainEvent(new PaymentReceivedEvent(Id, GrandTotal));
    }

    /// <summary>
    /// Assign transporter to the order
    /// </summary>
    public void AssignTransporter(Guid transporterId)
    {
        if (Status != OrderStatus.Confirmed)
            throw new InvalidOperationException("Can only assign transporter to confirmed orders");

        TransporterId = transporterId;
        Status = OrderStatus.Assigned;
        MarkAsUpdated();
    }

    /// <summary>
    /// Mark order as in transit
    /// </summary>
    public void MarkInTransit()
    {
        if (Status != OrderStatus.Assigned)
            throw new InvalidOperationException("Can only mark assigned orders as in transit");

        Status = OrderStatus.InTransit;
        MarkAsUpdated();
    }

    /// <summary>
    /// Mark order as delivered
    /// </summary>
    public void MarkAsDelivered()
    {
        if (Status != OrderStatus.InTransit)
            throw new InvalidOperationException("Can only mark in-transit orders as delivered");

        Status = OrderStatus.Delivered;
        DeliveredAt = DateTime.UtcNow;
        MarkAsUpdated();

        AddDomainEvent(new OrderDeliveredEvent(Id, BuyerId, TransporterId ?? Guid.Empty));
    }

    /// <summary>
    /// Cancel the order
    /// </summary>
    public void Cancel(string reason)
    {
        if (Status == OrderStatus.Delivered || Status == OrderStatus.Cancelled)
            throw new InvalidOperationException($"Cannot cancel order with status {Status}");

        if (string.IsNullOrWhiteSpace(reason))
            throw new ArgumentException("Cancellation reason is required", nameof(reason));

        Status = OrderStatus.Cancelled;
        CancellationReason = reason;
        MarkAsUpdated();
    }

    private void RecalculateTotal()
    {
        TotalAmount = _items.Any()
            ? _items.Select(i => i.TotalPrice).Aggregate((a, b) => a + b)
            : Money.Zero();

        GrandTotal = TotalAmount + LogisticsFee + ServiceFee;
    }

    public bool CanBeModified()
    {
        return Status == OrderStatus.Pending;
    }

    public bool IsDelivered()
    {
        return Status == OrderStatus.Delivered;
    }

    public bool IsCancelled()
    {
        return Status == OrderStatus.Cancelled;
    }
}
