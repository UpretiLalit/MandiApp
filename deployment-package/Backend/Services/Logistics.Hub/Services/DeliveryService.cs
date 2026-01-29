using Microsoft.EntityFrameworkCore;
using Logistics.Hub.Data;
using Logistics.Hub.Models;
using Logistics.Hub.DTOs;

namespace Logistics.Hub.Services;

public class DeliveryService : IDeliveryService
{
    private readonly LogisticsDbContext _context;

    public DeliveryService(LogisticsDbContext context)
    {
        _context = context;
    }

    public async Task<Delivery> CreateDeliveryAsync(CreateDeliveryRequest request)
    {
        var qrCode = $"QR-{Guid.NewGuid().ToString("N").Substring(0, 12).ToUpper()}";

        var delivery = new Delivery
        {
            OrderId = request.OrderId,
            TransporterId = request.TransporterId,
            BuyerId = request.BuyerId,
            PickupAddress = request.PickupAddress,
            DeliveryAddress = request.DeliveryAddress,
            Status = DeliveryStatus.Assigned,
            QrCodeForDelivery = qrCode
        };

        _context.Deliveries.Add(delivery);
        await _context.SaveChangesAsync();

        return delivery;
    }

    public async Task<Delivery?> GetDeliveryByOrderIdAsync(int orderId)
    {
        return await _context.Deliveries
            .Include(d => d.LocationTrackings.OrderByDescending(lt => lt.Timestamp).Take(10))
            .FirstOrDefaultAsync(d => d.OrderId == orderId);
    }

    public async Task<IEnumerable<Delivery>> GetTransporterDeliveriesAsync(string transporterId)
    {
        return await _context.Deliveries
            .Where(d => d.TransporterId == transporterId)
            .OrderByDescending(d => d.AssignedAt)
            .ToListAsync();
    }

    public async Task<bool> UpdateDeliveryStatusAsync(int deliveryId, DeliveryStatus status, string? qrCode = null)
    {
        var delivery = await _context.Deliveries.FindAsync(deliveryId);
        if (delivery == null)
            return false;

        delivery.Status = status;

        if (status == DeliveryStatus.PickedUp && delivery.PickedUpAt == null)
            delivery.PickedUpAt = DateTime.UtcNow;

        if (status == DeliveryStatus.Delivered)
        {
            if (qrCode != null && delivery.QrCodeForDelivery == qrCode)
                delivery.DeliveredAt = DateTime.UtcNow;
            else
                return false; // QR code doesn't match
        }

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> ConfirmDeliveryByQrAsync(int deliveryId, string qrCode)
    {
        return await UpdateDeliveryStatusAsync(deliveryId, DeliveryStatus.Delivered, qrCode);
    }
}
