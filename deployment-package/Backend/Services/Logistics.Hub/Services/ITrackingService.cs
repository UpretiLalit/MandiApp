using Logistics.Hub.Models;

namespace Logistics.Hub.Services;

public interface ITrackingService
{
    Task UpdateLocationAsync(int deliveryId, string transporterId, double latitude, double longitude, double? speed, double? accuracy);
    Task<Delivery?> GetDeliveryAsync(int deliveryId);
    Task<IEnumerable<LocationTracking>> GetLocationHistoryAsync(int deliveryId);
}
