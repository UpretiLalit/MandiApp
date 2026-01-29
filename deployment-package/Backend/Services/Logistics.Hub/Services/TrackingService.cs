using Microsoft.EntityFrameworkCore;
using Logistics.Hub.Data;
using Logistics.Hub.Models;

namespace Logistics.Hub.Services;

public class TrackingService : ITrackingService
{
    private readonly LogisticsDbContext _context;

    public TrackingService(LogisticsDbContext context)
    {
        _context = context;
    }

    public async Task UpdateLocationAsync(int deliveryId, string transporterId, double latitude, double longitude, double? speed, double? accuracy)
    {
        var delivery = await _context.Deliveries.FindAsync(deliveryId);
        if (delivery == null || delivery.TransporterId != transporterId)
            return;

        var tracking = new LocationTracking
        {
            DeliveryId = deliveryId,
            Latitude = latitude,
            Longitude = longitude,
            Speed = speed,
            Accuracy = accuracy,
            Timestamp = DateTime.UtcNow
        };

        _context.LocationTrackings.Add(tracking);
        await _context.SaveChangesAsync();
    }

    public async Task<Delivery?> GetDeliveryAsync(int deliveryId)
    {
        return await _context.Deliveries.FindAsync(deliveryId);
    }

    public async Task<IEnumerable<LocationTracking>> GetLocationHistoryAsync(int deliveryId)
    {
        return await _context.LocationTrackings
            .Where(lt => lt.DeliveryId == deliveryId)
            .OrderByDescending(lt => lt.Timestamp)
            .Take(100)
            .ToListAsync();
    }
}
