namespace Ordering.Domain.Aggregates.OrderAggregate;

/// <summary>
/// Order status enumeration
/// </summary>
public enum OrderStatus
{
    /// <summary>
    /// Order created but payment pending
    /// </summary>
    Pending = 0,

    /// <summary>
    /// Payment received, order confirmed
    /// </summary>
    Confirmed = 1,

    /// <summary>
    /// Order assigned to transporter
    /// </summary>
    Assigned = 2,

    /// <summary>
    /// Order picked up by transporter
    /// </summary>
    InTransit = 3,

    /// <summary>
    /// Order delivered successfully
    /// </summary>
    Delivered = 4,

    /// <summary>
    /// Order cancelled
    /// </summary>
    Cancelled = 5,

    /// <summary>
    /// Payment refunded
    /// </summary>
    Refunded = 6
}
