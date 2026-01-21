using Ordering.Domain.Aggregates.OrderAggregate;

namespace Ordering.Domain.Repositories;

/// <summary>
/// Repository interface for Order aggregate.
/// Defines contract for data access without implementation details.
/// </summary>
public interface IOrderRepository
{
    /// <summary>
    /// Get order by ID
    /// </summary>
    Task<Order?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get order by order number
    /// </summary>
    Task<Order?> GetByOrderNumberAsync(string orderNumber, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get all orders for a buyer
    /// </summary>
    Task<IEnumerable<Order>> GetByBuyerIdAsync(Guid buyerId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get all orders for a vendor
    /// </summary>
    Task<IEnumerable<Order>> GetByVendorIdAsync(Guid vendorId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get all orders assigned to a transporter
    /// </summary>
    Task<IEnumerable<Order>> GetByTransporterIdAsync(Guid transporterId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get orders by status
    /// </summary>
    Task<IEnumerable<Order>> GetByStatusAsync(OrderStatus status, CancellationToken cancellationToken = default);

    /// <summary>
    /// Add new order
    /// </summary>
    Task<Order> AddAsync(Order order, CancellationToken cancellationToken = default);

    /// <summary>
    /// Update existing order
    /// </summary>
    Task UpdateAsync(Order order, CancellationToken cancellationToken = default);

    /// <summary>
    /// Delete order
    /// </summary>
    Task DeleteAsync(Order order, CancellationToken cancellationToken = default);

    /// <summary>
    /// Save changes to database
    /// </summary>
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
