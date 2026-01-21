using Microsoft.EntityFrameworkCore;
using Ordering.API.Data;
using Ordering.API.Models;

namespace Ordering.API.Services;

public class BuyerService : IBuyerService
{
    private readonly OrderingDbContext _context;

    public BuyerService(OrderingDbContext context)
    {
        _context = context;
    }

    public async Task<Buyer?> GetByIdAsync(string id)
    {
        return await _context.Buyers.FindAsync(id);
    }

    public async Task<Buyer> CreateAsync(Buyer buyer)
    {
        buyer.CreatedAt = DateTime.UtcNow;
        _context.Buyers.Add(buyer);
        await _context.SaveChangesAsync();
        return buyer;
    }

    public async Task<Buyer?> UpdateAsync(string id, Buyer buyer)
    {
        var existing = await _context.Buyers.FindAsync(id);
        if (existing == null)
            return null;

        existing.FullName = buyer.FullName;
        existing.PhoneNumber = buyer.PhoneNumber;
        existing.Email = buyer.Email;
        existing.CompanyName = buyer.CompanyName;
        existing.BusinessAddress = buyer.BusinessAddress;
        existing.DeliveryAddress = buyer.DeliveryAddress;
        existing.IsVerified = buyer.IsVerified;

        await _context.SaveChangesAsync();
        return existing;
    }

    public async Task<IEnumerable<Order>> GetOrdersAsync(string buyerId)
    {
        return await _context.Orders
            .Where(o => o.BuyerId == buyerId)
            .Include(o => o.OrderItems)
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync();
    }

    public async Task<BuyerStats> GetStatsAsync(string buyerId)
    {
        var buyer = await _context.Buyers.FindAsync(buyerId);
        if (buyer == null)
            return new BuyerStats();

        var orders = await _context.Orders
            .Where(o => o.BuyerId == buyerId)
            .ToListAsync();

        return new BuyerStats
        {
            TotalOrders = orders.Count,
            TotalSpent = orders.Where(o => o.Status == OrderStatus.Delivered).Sum(o => o.TotalAmount),
            ActiveOrders = orders.Count(o => o.Status != OrderStatus.Delivered && o.Status != OrderStatus.Cancelled),
            CompletedOrders = orders.Count(o => o.Status == OrderStatus.Delivered),
            CreditLimit = buyer.CreditLimit,
            OutstandingBalance = buyer.OutstandingBalance,
            AvailableCredit = buyer.CreditLimit - buyer.OutstandingBalance
        };
    }
}
