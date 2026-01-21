using Microsoft.EntityFrameworkCore;
using Ordering.Domain.Aggregates.OrderAggregate;
using Ordering.Domain.Repositories;

namespace Ordering.Infrastructure.Persistence.Repositories;

public class OrderRepository : IOrderRepository
{
    private readonly DbContext _context;
    private readonly DbSet<Order> _orders;

    public OrderRepository(DbContext context)
    {
        _context = context;
        _orders = context.Set<Order>();
    }

    public async Task<Order?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _orders
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.Id == id, cancellationToken);
    }

    public async Task<Order?> GetByOrderNumberAsync(string orderNumber, CancellationToken cancellationToken = default)
    {
        return await _orders
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.OrderNumber == orderNumber, cancellationToken);
    }

    public async Task<IEnumerable<Order>> GetByBuyerIdAsync(Guid buyerId, CancellationToken cancellationToken = default)
    {
        return await _orders
            .Include(o => o.Items)
            .Where(o => o.BuyerId == buyerId)
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Order>> GetByVendorIdAsync(Guid vendorId, CancellationToken cancellationToken = default)
    {
        return await _orders
            .Include(o => o.Items)
            .Where(o => o.VendorId == vendorId)
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Order>> GetByTransporterIdAsync(Guid transporterId, CancellationToken cancellationToken = default)
    {
        return await _orders
            .Include(o => o.Items)
            .Where(o => o.TransporterId == transporterId)
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Order>> GetByStatusAsync(OrderStatus status, CancellationToken cancellationToken = default)
    {
        return await _orders
            .Include(o => o.Items)
            .Where(o => o.Status == status)
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<Order> AddAsync(Order order, CancellationToken cancellationToken = default)
    {
        await _orders.AddAsync(order, cancellationToken);
        return order;
    }

    public Task UpdateAsync(Order order, CancellationToken cancellationToken = default)
    {
        _context.Entry(order).State = EntityState.Modified;
        return Task.CompletedTask;
    }

    public Task DeleteAsync(Order order, CancellationToken cancellationToken = default)
    {
        _orders.Remove(order);
        return Task.CompletedTask;
    }

    public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        return await _context.SaveChangesAsync(cancellationToken);
    }
}
