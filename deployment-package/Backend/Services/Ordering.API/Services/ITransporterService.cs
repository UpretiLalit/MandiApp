using Ordering.API.Models;

namespace Ordering.API.Services;

public interface ITransporterService
{
    Task<Transporter?> GetByIdAsync(string id);
    Task<IEnumerable<Transporter>> GetAllAsync();
    Task<IEnumerable<Transporter>> GetAvailableAsync();
    Task<IEnumerable<Transporter>> GetNearbyAsync(double latitude, double longitude, double radiusKm);
    Task<Transporter> CreateAsync(Transporter transporter);
    Task<Transporter?> UpdateAsync(string id, Transporter transporter);
    Task<bool> UpdateLocationAsync(string transporterId, double latitude, double longitude);
    Task<bool> ToggleAvailabilityAsync(string transporterId);
    Task<IEnumerable<Order>> GetDeliveriesAsync(string transporterId);
    Task<TransporterStats> GetStatsAsync(string transporterId);
}

public class TransporterStats
{
    public int TotalDeliveries { get; set; }
    public int CompletedDeliveries { get; set; }
    public int ActiveDeliveries { get; set; }
    public decimal TotalEarnings { get; set; }
    public double AverageRating { get; set; }
}
