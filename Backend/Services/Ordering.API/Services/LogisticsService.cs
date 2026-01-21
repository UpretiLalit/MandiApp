using Ordering.API.Data;
using Ordering.API.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.SignalR;
using Ordering.API.Hubs;

namespace Ordering.API.Services;

public class LogisticsService : ILogisticsService
{
    private readonly OrderingDbContext _context;
    private readonly IHubContext<TrackingHub> _hubContext;

    public LogisticsService(OrderingDbContext context, IHubContext<TrackingHub> hubContext)
    {
        _context = context;
        _hubContext = hubContext;
    }

    public async Task<IEnumerable<MandiHeatmapDto>> GetMandiHeatmapAsync()
    {
        var activeOrdersByMandi = await _context.Orders
            .Where(o => o.Status == OrderStatus.ReadyForDispatch || 
                       o.Status == OrderStatus.InTransit || 
                       o.Status == OrderStatus.Processing)
            .GroupBy(o => o.MandiId)
            .Select(g => new
            {
                MandiId = g.Key,
                ActiveOrders = g.Count()
            })
            .ToListAsync();

        var transportersByMandi = await _context.Users
            .Where(u => u.Role == "Transporter" && u.IsActive && u.Status == "active")
            .GroupBy(u => u.AssignedMandiId)
            .Select(g => new
            {
                MandiId = g.Key,
                AvailableTransporters = g.Count()
            })
            .ToListAsync();

        var mandis = new[]
        {
            new { Id = "mandi-001", Name = "Azadpur Mandi, Delhi", Lat = 28.7041, Lng = 77.1750 },
            new { Id = "mandi-002", Name = "Mumbai APMC, Vashi", Lat = 19.0760, Lng = 73.0097 },
            new { Id = "mandi-003", Name = "Bangalore APMC, Yeshwanthpur", Lat = 13.0281, Lng = 77.5467 },
            new { Id = "mandi-004", Name = "Okhla Mandi, Delhi", Lat = 28.5355, Lng = 77.2730 },
            new { Id = "mandi-005", Name = "Ghazipur Mandi, Delhi", Lat = 28.6692, Lng = 77.3235 }
        };

        return mandis.Select(m =>
        {
            var orders = activeOrdersByMandi.FirstOrDefault(a => a.MandiId == m.Id)?.ActiveOrders ?? 0;
            var transporters = transportersByMandi.FirstOrDefault(t => t.MandiId == m.Id)?.AvailableTransporters ?? 0;
            var demandScore = transporters > 0 ? (double)orders / transporters : orders;
            
            return new MandiHeatmapDto
            {
                MandiId = m.Id,
                MandiName = m.Name,
                Latitude = m.Lat,
                Longitude = m.Lng,
                ActiveOrders = orders,
                AvailableTransporters = transporters,
                DemandScore = demandScore,
                Color = demandScore >= 3 ? "#ff4444" : demandScore >= 1.5 ? "#ffaa00" : "#00cc66"
            };
        }).ToList();
    }

    public async Task<IEnumerable<StuckOrderDto>> GetStuckOrdersAsync(int thresholdMinutes)
    {
        var thresholdTime = DateTime.UtcNow.AddMinutes(-thresholdMinutes);

        return await _context.Orders
            .Where(o => (o.Status == OrderStatus.ReadyForDispatch || o.Status == OrderStatus.InTransit) 
                && o.AssignedAt.HasValue 
                && o.AssignedAt.Value <= thresholdTime)
            .Select(o => new StuckOrderDto
            {
                OrderId = o.Id.ToString(),
                OrderNumber = o.OrderNumber,
                BuyerName = o.BuyerName ?? "Unknown",
                VendorName = o.VendorName ?? "Unknown",
                TransporterName = o.TransporterName ?? "Unknown",
                TransporterId = o.TransporterId ?? string.Empty,
                Status = o.Status.ToString(),
                AssignedAt = o.AssignedAt ?? DateTime.UtcNow,
                StuckDuration = (int)(DateTime.UtcNow - (o.AssignedAt ?? DateTime.UtcNow)).TotalMinutes,
                PickupLocation = o.PickupAddress ?? "Unknown",
                DeliveryLocation = o.DeliveryAddress ?? "Unknown",
                IsMoving = false
            })
            .ToListAsync();
    }

    public async Task<IEnumerable<AvailableTransporterDto>> GetAvailableTransportersAsync(string? mandiId)
    {
        var query = _context.Transporters
            .Where(t => t.IsAvailable && t.IsVerified);

        // Note: Transporter doesn't have AssignedMandiId, removing filter for now
        // if (!string.IsNullOrEmpty(mandiId))
        // {
        //     query = query.Where(t => t.AssignedMandiId == mandiId);
        // }

        return await query
            .Select(t => new AvailableTransporterDto
            {
                Id = t.Id,
                FullName = t.FullName,
                VehicleType = t.VehicleType.ToString(),
                VehicleNumber = t.VehicleNumber ?? "Unknown",
                CurrentLatitude = t.CurrentLatitude,
                CurrentLongitude = t.CurrentLongitude,
                Status = "active",
                ActiveDeliveries = _context.Orders.Count(o => o.TransporterId == t.Id && 
                    (o.Status == OrderStatus.InTransit || o.Status == OrderStatus.ReadyForDispatch))
            })
            .ToListAsync();
    }

    public async Task<bool> ReassignOrderAsync(int orderId, string newTransporterId)
    {
        var order = await _context.Orders.FindAsync(orderId);
        var transporter = await _context.Transporters.FindAsync(newTransporterId);

        if (order == null || transporter == null)
            return false;

        order.TransporterId = newTransporterId;
        order.TransporterName = transporter.FullName;
        order.AssignedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        await _hubContext.Clients.Group($"order-{orderId}").SendAsync("OrderUpdated", new
        {
            orderId = orderId,
            status = order.Status.ToString(),
            transporterId = newTransporterId,
            transporterName = transporter.FullName,
            message = "Order reassigned to new transporter",
            timestamp = DateTime.UtcNow
        });

        return true;
    }

    public async Task<bool> FlagStuckOrderAsync(int orderId)
    {
        var order = await _context.Orders.FindAsync(orderId);
        if (order == null)
            return false;

        await _hubContext.Clients.Group("admin").SendAsync("StuckOrderFlagged", new
        {
            orderId = orderId,
            orderNumber = order.OrderNumber,
            transporterId = order.TransporterId,
            transporterName = order.TransporterName,
            status = order.Status.ToString(),
            timestamp = DateTime.UtcNow
        });

        return true;
    }
}
