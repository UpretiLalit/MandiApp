using Ordering.API.Models;

namespace Ordering.API.Services;

public interface IVendorService
{
    Task<Vendor?> GetByIdAsync(string id);
    Task<IEnumerable<Vendor>> GetAllAsync();
    Task<Vendor> CreateAsync(Vendor vendor);
    Task<Vendor?> UpdateAsync(string id, Vendor vendor);
    Task<IEnumerable<Order>> GetOrdersAsync(string vendorId);
    Task<VendorStats> GetStatsAsync(string vendorId);
    Task<bool> UpdateLocationAsync(string vendorId, double latitude, double longitude);
}

public class VendorStats
{
    public int TotalOrders { get; set; }
    public decimal TotalRevenue { get; set; }
    public int PendingOrders { get; set; }
    public int CompletedOrders { get; set; }
    public double AverageRating { get; set; }
}
