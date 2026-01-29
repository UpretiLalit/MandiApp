using Ordering.API.Models;

namespace Ordering.API.Services;

public interface IBuyerService
{
    Task<Buyer?> GetByIdAsync(string id);
    Task<Buyer> CreateAsync(Buyer buyer);
    Task<Buyer?> UpdateAsync(string id, Buyer buyer);
    Task<IEnumerable<Order>> GetOrdersAsync(string buyerId);
    Task<BuyerStats> GetStatsAsync(string buyerId);
}

public class BuyerStats
{
    public int TotalOrders { get; set; }
    public decimal TotalSpent { get; set; }
    public int ActiveOrders { get; set; }
    public int CompletedOrders { get; set; }
    public decimal CreditLimit { get; set; }
    public decimal OutstandingBalance { get; set; }
    public decimal AvailableCredit { get; set; }
}
