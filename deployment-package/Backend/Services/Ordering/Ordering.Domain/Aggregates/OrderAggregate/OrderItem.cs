using Ordering.Domain.Common;
using Ordering.Domain.ValueObjects;

namespace Ordering.Domain.Aggregates.OrderAggregate;

/// <summary>
/// Represents an item within an order.
/// Entity within the Order aggregate.
/// </summary>
public class OrderItem : BaseEntity
{
    public Guid OrderId { get; private set; }
    public Guid ProductId { get; private set; }
    public string ProductName { get; private set; } = string.Empty;
    public Money UnitPrice { get; private set; } = Money.Zero();
    public int Quantity { get; private set; }
    public Money TotalPrice { get; private set; } = Money.Zero();

    private OrderItem() : base() { } // For EF Core

    internal static OrderItem Create(Guid productId, string productName, Money unitPrice, int quantity)
    {
        if (quantity <= 0)
            throw new ArgumentException("Quantity must be greater than zero", nameof(quantity));

        if (string.IsNullOrWhiteSpace(productName))
            throw new ArgumentException("Product name is required", nameof(productName));

        var orderItem = new OrderItem
        {
            ProductId = productId,
            ProductName = productName,
            UnitPrice = unitPrice,
            Quantity = quantity,
            TotalPrice = unitPrice * quantity
        };

        return orderItem;
    }

    internal void UpdateQuantity(int newQuantity)
    {
        if (newQuantity <= 0)
            throw new ArgumentException("Quantity must be greater than zero", nameof(newQuantity));

        Quantity = newQuantity;
        TotalPrice = UnitPrice * newQuantity;
        MarkAsUpdated();
    }

    internal void SetOrderId(Guid orderId)
    {
        OrderId = orderId;
    }
}
