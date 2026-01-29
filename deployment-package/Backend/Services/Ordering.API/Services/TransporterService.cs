using Ordering.API.Data;
using Ordering.API.Models;
using Microsoft.EntityFrameworkCore;

namespace Ordering.API.Services;

public class TransporterService : ITransporterService
{
    private readonly OrderingDbContext _context;

    public TransporterService(OrderingDbContext context)
    {
        _context = context;
    }

    public async Task<Transporter?> GetByIdAsync(string id)
    {
        return await _context.Transporters.FindAsync(id);
    }

    public async Task<IEnumerable<Transporter>> GetAllAsync()
    {
        return await _context.Transporters.ToListAsync();
    }

    public async Task<IEnumerable<Transporter>> GetAvailableAsync()
    {
        return await _context.Transporters
            .Where(t => t.IsAvailable && t.IsVerified)
            .ToListAsync();
    }

    public async Task<IEnumerable<Transporter>> GetNearbyAsync(double latitude, double longitude, double radiusKm)
    {
        var transporters = await _context.Transporters
            .Where(t => t.IsAvailable && t.IsVerified)
            .ToListAsync();

        return transporters.Where(t => 
        {
            if (string.IsNullOrEmpty(t.CurrentLatitude) || string.IsNullOrEmpty(t.CurrentLongitude))
                return false;

            if (!double.TryParse(t.CurrentLatitude, out var tLat) || !double.TryParse(t.CurrentLongitude, out var tLon))
                return false;

            var distance = CalculateDistance(latitude, longitude, tLat, tLon);
            return distance <= radiusKm;
        }).ToList();
    }

    public async Task<Transporter> CreateAsync(Transporter transporter)
    {
        transporter.CreatedAt = DateTime.UtcNow;
        transporter.LastActiveAt = DateTime.UtcNow;
        _context.Transporters.Add(transporter);
        await _context.SaveChangesAsync();
        return transporter;
    }

    public async Task<Transporter?> UpdateAsync(string id, Transporter transporter)
    {
        var existing = await _context.Transporters.FindAsync(id);
        if (existing == null)
            return null;

        existing.FullName = transporter.FullName;
        existing.PhoneNumber = transporter.PhoneNumber;
        existing.VehicleNumber = transporter.VehicleNumber;
        existing.VehicleType = transporter.VehicleType;
        existing.IsVerified = transporter.IsVerified;
        existing.IsAvailable = transporter.IsAvailable;

        await _context.SaveChangesAsync();
        return existing;
    }

    public async Task<bool> UpdateLocationAsync(string transporterId, double latitude, double longitude)
    {
        var transporter = await _context.Transporters.FindAsync(transporterId);
        if (transporter == null)
            return false;

        transporter.CurrentLatitude = latitude.ToString();
        transporter.CurrentLongitude = longitude.ToString();
        transporter.LastLocationUpdateAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> ToggleAvailabilityAsync(string transporterId)
    {
        var transporter = await _context.Transporters.FindAsync(transporterId);
        if (transporter == null)
            return false;

        transporter.IsAvailable = !transporter.IsAvailable;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<IEnumerable<Order>> GetDeliveriesAsync(string transporterId)
    {
        return await _context.Orders
            .Where(o => o.TransporterId == transporterId)
            .Include(o => o.OrderItems)
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync();
    }

    public async Task<TransporterStats> GetStatsAsync(string transporterId)
    {
        var deliveries = await _context.Orders
            .Where(o => o.TransporterId == transporterId)
            .ToListAsync();

        return new TransporterStats
        {
            TotalDeliveries = deliveries.Count,
            CompletedDeliveries = deliveries.Count(o => o.Status == OrderStatus.Delivered),
            ActiveDeliveries = deliveries.Count(o => o.Status == OrderStatus.InTransit),
            TotalEarnings = deliveries.Where(o => o.Status == OrderStatus.Delivered).Sum(o => o.LogisticsFee),
            AverageRating = 4.7
        };
    }

    private double CalculateDistance(double lat1, double lon1, double lat2, double lon2)
    {
        const double R = 6371;
        var dLat = ToRadians(lat2 - lat1);
        var dLon = ToRadians(lon2 - lon1);

        var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                Math.Cos(ToRadians(lat1)) * Math.Cos(ToRadians(lat2)) *
                Math.Sin(dLon / 2) * Math.Sin(dLon / 2);

        var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
        return R * c;
    }

    private double ToRadians(double degrees)
    {
        return degrees * Math.PI / 180;
    }
}
