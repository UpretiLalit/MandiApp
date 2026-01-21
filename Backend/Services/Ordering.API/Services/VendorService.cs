using Microsoft.EntityFrameworkCore;
using Ordering.API.Data;
using Ordering.API.Models;

namespace Ordering.API.Services;

public class VendorService : IVendorService
{
    private readonly OrderingDbContext _context;

    public VendorService(OrderingDbContext context)
    {
        _context = context;
    }

    public async Task<Vendor?> GetByIdAsync(string id)
    {
        return await _context.Vendors.FindAsync(id);
    }

    public async Task<IEnumerable<Vendor>> GetAllAsync()
    {
        return await _context.Vendors
            .Where(v => v.IsActive)
            .OrderBy(v => v.BusinessName)
            .ToListAsync();
    }

    public async Task<Vendor> CreateAsync(Vendor vendor)
    {
        vendor.CreatedAt = DateTime.UtcNow;
        vendor.LastActiveAt = DateTime.UtcNow;
        _context.Vendors.Add(vendor);
        await _context.SaveChangesAsync();
        return vendor;
    }

    public async Task<Vendor?> UpdateAsync(string id, Vendor vendor)
    {
        var existing = await _context.Vendors.FindAsync(id);
        if (existing == null)
            return null;

        existing.FullName = vendor.FullName;
        existing.PhoneNumber = vendor.PhoneNumber;
        existing.BusinessName = vendor.BusinessName;
        existing.BusinessAddress = vendor.BusinessAddress;
        existing.Latitude = vendor.Latitude;
        existing.Longitude = vendor.Longitude;
        existing.IsVerified = vendor.IsVerified;
        existing.IsActive = vendor.IsActive;

        await _context.SaveChangesAsync();
        return existing;
    }

    public async Task<IEnumerable<Order>> GetOrdersAsync(string vendorId)
    {
        return await _context.Orders
            .Where(o => o.OrderItems.Any(oi => oi.VendorId == vendorId))
            .Include(o => o.OrderItems)
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync();
    }

    public async Task<VendorStats> GetStatsAsync(string vendorId)
    {
        var vendor = await _context.Vendors.FindAsync(vendorId);
        if (vendor == null)
            return new VendorStats();

        var orders = await _context.Orders
            .Where(o => o.OrderItems.Any(oi => oi.VendorId == vendorId))
            .ToListAsync();

        return new VendorStats
        {
            TotalOrders = orders.Count,
            TotalRevenue = orders.Where(o => o.Status == OrderStatus.Delivered).Sum(o => o.ProduceTotal),
            PendingOrders = orders.Count(o => o.Status == OrderStatus.VendorsNotified || o.Status == OrderStatus.Processing),
            CompletedOrders = orders.Count(o => o.Status == OrderStatus.Delivered),
            AverageRating = (double)vendor.Rating
        };
    }

    public async Task<bool> UpdateLocationAsync(string vendorId, double latitude, double longitude)
    {
        var vendor = await _context.Vendors.FindAsync(vendorId);
        if (vendor == null)
            return false;

        vendor.Latitude = latitude.ToString();
        vendor.Longitude = longitude.ToString();
        await _context.SaveChangesAsync();
        return true;
    }
}
