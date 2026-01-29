using Logistics.Hub.Models;
using Logistics.Hub.DTOs;

namespace Logistics.Hub.Services;

public interface IDeliveryService
{
    Task<Delivery> CreateDeliveryAsync(CreateDeliveryRequest request);
    Task<Delivery?> GetDeliveryByOrderIdAsync(int orderId);
    Task<IEnumerable<Delivery>> GetTransporterDeliveriesAsync(string transporterId);
    Task<bool> UpdateDeliveryStatusAsync(int deliveryId, DeliveryStatus status, string? qrCode = null);
    Task<bool> ConfirmDeliveryByQrAsync(int deliveryId, string qrCode);
}
