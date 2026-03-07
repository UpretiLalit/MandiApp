using Microsoft.EntityFrameworkCore;
using Ordering.API.Data;
using Ordering.API.Models;
using Ordering.API.DTOs;

namespace Ordering.API.Services;

public class OrderService : IOrderService
{
    private readonly OrderingDbContext _context;
    private readonly ICartService _cartService;

    public OrderService(OrderingDbContext context, ICartService cartService)
    {
        _context = context;
        _cartService = cartService;
    }

    public async Task<Order> CreateOrderAsync(string buyerId, CreateOrderRequest request)
    {
        var orderNumber = $"ORD-{DateTime.UtcNow:yyyyMMddHHmmss}-{Guid.NewGuid().ToString("N").Substring(0, 6).ToUpper()}";

        // Phase 1: Create order with escrow payment and cost breakdown
        var order = new Order
        {
            BuyerId = buyerId,
            OrderNumber = orderNumber,
            ProduceTotal = request.ProduceTotal,
            LogisticsFee = request.LogisticsFee,
            ServiceFee = request.ServiceFee,
            TotalAmount = request.TotalLandingCost,
            Status = OrderStatus.PaymentReceived,
            DeliveryAddress = request.DeliveryAddress,
            IsEscrow = request.IsEscrow,
            EscrowStatus = EscrowStatus.Held
        };

        // Add order items grouped by vendor
        var vendorGroups = request.Items.GroupBy(i => i.VendorId).ToList();
        
        foreach (var item in request.Items)
        {
            order.OrderItems.Add(new OrderItem
            {
                ProductId = item.ProductId,
                ProductName = item.ProductName,
                VendorId = item.VendorId ?? string.Empty,
                Quantity = item.Quantity,
                Unit = item.Unit ?? "kg",
                UnitPrice = item.UnitPrice,
                TotalPrice = item.Quantity * item.UnitPrice
            });
        }

        _context.Orders.Add(order);
        await _context.SaveChangesAsync();
        
        // Phase 1: Broadcast pickup requests to vendors
        await BroadcastPickupRequestsAsync(order, vendorGroups);
        
        // Update order status to VendorsNotified
        order.Status = OrderStatus.VendorsNotified;
        order.VendorsNotifiedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        // Clear buyer's cart after successful order
        await _cartService.ClearCartAsync(buyerId);

        return order;
    }
    
    private async Task BroadcastPickupRequestsAsync(Order order, List<IGrouping<string, OrderItemDto>> vendorGroups)
    {
        // Step B: THE SPLIT - Create notifications for each vendor with their specific items
        // Phase 1: Send pickup requests to each vendor
        // In a real implementation, this would:
        // 1. Send push notifications to vendor mobile apps
        // 2. Send SMS/WhatsApp notifications
        // 3. Create vendor-specific pickup tasks in database
        // 4. Log the broadcast event
        
        Console.WriteLine($"\n═══════════════════════════════════════════════════════");
        Console.WriteLine($"📦 ORDER SPLIT - Master Order {order.OrderNumber}");
        Console.WriteLine($"   Total: ₹{order.TotalAmount} (Escrow: {order.EscrowStatus})");
        Console.WriteLine($"   Vendors: {vendorGroups.Count}");
        Console.WriteLine($"═══════════════════════════════════════════════════════\n");
        
        foreach (var vendorGroup in vendorGroups)
        {
            var vendorId = vendorGroup.Key;
            var items = vendorGroup.ToList();
            var vendorTotal = items.Sum(i => i.Quantity * i.UnitPrice);
            var itemsSummary = string.Join(", ", items.Select(i => $"{i.Quantity}kg {i.ProductName}"));
            
            Console.WriteLine($"🔔 VENDOR NOTIFICATION [{vendorId}]");
            Console.WriteLine($"   Order: {order.OrderNumber}");
            Console.WriteLine($"   Items: {itemsSummary}");
            Console.WriteLine($"   Subtotal: ₹{vendorTotal}");
            Console.WriteLine($"   Status: IsReady = false (awaiting vendor confirmation)");
            Console.WriteLine($"   Action Required: Pack items and mark ready\n");
            
            // TODO: Integrate with notification service
            // await _notificationService.SendPickupRequestAsync(vendorId, new PickupRequest
            // {
            //     OrderNumber = order.OrderNumber,
            //     Items = items,
            //     TotalAmount = vendorTotal,
            //     PickupDeadline = DateTime.UtcNow.AddHours(2),
            //     Message = $"Pick {itemsSummary} for Order #{order.OrderNumber}"
            // });
        }
        
        Console.WriteLine($"✓ {vendorGroups.Count} vendors notified at {DateTime.UtcNow:HH:mm:ss}\n");
        
        await Task.CompletedTask;
    }

    public async Task<Order?> GetOrderByIdAsync(int orderId)
    {
        return await _context.Orders
            .Include(o => o.OrderItems)
            .Include(o => o.Payment)
            .FirstOrDefaultAsync(o => o.Id == orderId);
    }

    public async Task<IEnumerable<Order>> GetOrdersAsync()
    {
        return await _context.Orders
            .Include(o => o.OrderItems)
            .Include(o => o.Payment)
            .ToListAsync();
    }

    public async Task<IEnumerable<Order>> GetBuyerOrdersAsync(string buyerId)
    {
        return await _context.Orders
            .Include(o => o.OrderItems)
            .Include(o => o.Payment)
            .Where(o => o.BuyerId == buyerId)
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<Order>> GetVendorOrdersAsync(string vendorId)
    {
        return await _context.Orders
            .Include(o => o.OrderItems)
            .Include(o => o.Payment)
            .Where(o => o.OrderItems.Any(oi => oi.VendorId == vendorId))
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync();
    }

    public async Task<bool> UpdateOrderStatusAsync(int orderId, OrderStatus status)
    {
        var order = await _context.Orders.FindAsync(orderId);
        if (order == null)
            return false;

        order.Status = status;

        if (status == OrderStatus.Delivered)
            order.CompletedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> AssignTransporterAsync(int orderId, string transporterId)
    {
        var order = await _context.Orders.FindAsync(orderId);
        if (order == null)
            return false;

        order.TransporterId = transporterId;
        order.Status = OrderStatus.InTransit;
        await _context.SaveChangesAsync();

        return true;
    }
    
    // Phase 2: Vendor marks items ready for pickup
    public async Task<bool> MarkVendorItemsReadyAsync(int orderId, string vendorId)
    {
        var order = await _context.Orders
            .Include(o => o.OrderItems)
            .FirstOrDefaultAsync(o => o.Id == orderId);
            
        if (order == null)
            return false;
            
        var vendorItems = order.OrderItems.Where(oi => oi.VendorId == vendorId).ToList();
        
        if (!vendorItems.Any())
            return false;
            
        // Mark vendor's items as ready and generate QR codes
        foreach (var item in vendorItems)
        {
            item.IsReadyForPickup = true;
            item.MarkedReadyAt = DateTime.UtcNow;
            item.PickupQRCode = $"PICKUP-{order.OrderNumber}-VND-{vendorId}-ITM-{item.Id}";
        }
        
        await _context.SaveChangesAsync();
        
        // Phase 2: Check if ALL vendors are ready, then assign transporter
        await CheckAndAssignTransporterAsync(order);
        
        return true;
    }
    
    private async Task CheckAndAssignTransporterAsync(Order order)
    {
        // Check if all items in the order are marked ready
        var allItemsReady = order.OrderItems.All(oi => oi.IsReadyForPickup);
        
        if (allItemsReady && order.Status == OrderStatus.VendorsNotified)
        {
            // All vendors ready - assign nearest transporter
            order.Status = OrderStatus.ReadyForDispatch;
            await _context.SaveChangesAsync();
            
            // TODO: Integrate with TransporterService to find nearest
            Console.WriteLine($"[PHASE 2] All vendors ready for Order {order.OrderNumber}. Pinging nearest transporter...");
        }
    }
    
    // Phase 3: Buyer confirms delivery (scans QR)
    public async Task<bool> ConfirmDeliveryAsync(int orderId, string buyerId)
    {
        var order = await _context.Orders
            .Include(o => o.OrderItems)
            .Include(o => o.Payment)
            .FirstOrDefaultAsync(o => o.Id == orderId);
            
        if (order == null || order.BuyerId != buyerId)
            return false;
            
        if (order.Status != OrderStatus.InTransit)
        {
            Console.WriteLine($"[DELIVERY ERROR] Order {order.OrderNumber} is not InTransit (current: {order.Status})");
            return false;
        }
        
        // Generate delivery confirmation QR
        order.DeliveryQRCode = $"DELIVERY-{order.OrderNumber}-CONF-{DateTime.UtcNow:yyyyMMddHHmmss}";
        order.DeliveryConfirmedAt = DateTime.UtcNow;
        order.DeliveryConfirmedBy = buyerId;
        order.Status = OrderStatus.Delivered;
        order.CompletedAt = DateTime.UtcNow;
        
        await _context.SaveChangesAsync();
        
        // Phase 3: Release escrow and distribute payments
        var paymentService = new PaymentService(_context, null!, null!); // TODO: Inject properly
        await paymentService.ReleaseEscrowAsync(orderId);
        
        Console.WriteLine($"[PHASE 3] ✓ Delivery confirmed for Order {order.OrderNumber}");
        
        return true;
    }
    
    public async Task UpdateOrderAsync(Order order)
    {
        _context.Orders.Update(order);
        await _context.SaveChangesAsync();
    }

    public async Task<IEnumerable<object>> GetTransporterJobsAsync()
    {
        var orders = await _context.Orders
            .Include(o => o.OrderItems)
            .Where(o => o.Status == OrderStatus.PaymentReceived && 
                       o.OrderItems.Any() &&
                       o.OrderItems.All(i => i.IsReadyForPickup) &&
                       string.IsNullOrEmpty(o.TransporterId))
            .ToListAsync();

        return orders.Select(order => {
            var vendorCount = order.OrderItems.Select(i => i.VendorId).Distinct().Count();
            var totalWeight = order.OrderItems.Sum(i => i.Quantity);
            var crateCount = (int)Math.Ceiling(totalWeight / 20.0);
            
            return new {
                id = order.Id,
                orderNumber = order.OrderNumber,
                pickupLocation = "Azadpur Mandi",
                vendorCount,
                dropLocation = order.DeliveryAddress ?? "Unknown",
                distance = 4.2,
                payload = $"{crateCount} Crates",
                crateCount,
                weight = (int)totalWeight,
                earning = order.LogisticsFee,
                pickupTime = "ASAP",
                createdAt = order.CreatedAt
            };
        }).ToList();
    }

    public async Task<bool> AcceptTransporterJobAsync(int orderId, string transporterId)
    {
        var order = await GetOrderByIdAsync(orderId);
        if (order == null || !string.IsNullOrEmpty(order.TransporterId))
            return false;

        order.TransporterId = transporterId;
        order.Status = OrderStatus.InTransit;
        order.AssignedAt = DateTime.UtcNow;
        await UpdateOrderAsync(order);

        return true;
    }

    public Task<object> CreatePaymentOrderAsync(CreateOrderRequest request)
    {
        var amountInPaise = (int)(request.TotalLandingCost * 100);
        var razorpayOrderId = $"order_{Guid.NewGuid().ToString("N").Substring(0, 14)}";
        
        return Task.FromResult<object>(new
        {
            razorpayOrderId = razorpayOrderId,
            amount = amountInPaise,
            currency = "INR",
            key = "rzp_test_YOUR_KEY_ID"
        });
    }

    public async Task<object> CompletePaymentAsync(string buyerId, CompletePaymentRequest request)
    {
        var order = await CreateOrderAsync(buyerId, new CreateOrderRequest
        {
            Items = request.Items,
            DeliveryAddress = request.DeliveryAddress,
            ProduceTotal = request.ProduceTotal,
            LogisticsFee = request.LogisticsFee,
            ServiceFee = request.ServiceFee,
            TotalLandingCost = request.TotalLandingCost,
            PaymentMethod = request.PaymentMethod,
            IsEscrow = false
        });

        order.PaymentId = request.PaymentId;
        order.RazorpayOrderId = request.RazorpayOrderId;
        order.Status = OrderStatus.PaymentReceived;
        await UpdateOrderAsync(order);

        var vendorGroups = request.Items.GroupBy(i => i.VendorId);
        var childOrders = vendorGroups.Select(vendorGroup => new
        {
            vendorId = vendorGroup.Key,
            vendorName = $"Vendor {vendorGroup.Key}",
            orderNumber = $"CO-{DateTime.UtcNow:yyyyMMdd}-{vendorGroup.Key.Substring(0, Math.Min(4, vendorGroup.Key.Length))}-{Guid.NewGuid().ToString("N").Substring(0, 4).ToUpper()}",
            itemCount = vendorGroup.Count(),
            totalQuantity = vendorGroup.Sum(i => i.Quantity),
            subtotal = vendorGroup.Sum(i => i.Quantity * i.UnitPrice),
            status = "AwaitingPacking",
            items = vendorGroup.Select(i => new
            {
                productName = i.ProductName,
                quantity = i.Quantity,
                unitPrice = i.UnitPrice
            }).ToList()
        }).ToList();

        return new
        {
            success = true,
            message = "Payment successful! Order split completed.",
            parentOrder = new
            {
                id = order.Id,
                orderNumber = order.OrderNumber,
                status = "Paid",
                totalAmount = order.TotalAmount,
                paymentId = request.PaymentId
            },
            childOrders = childOrders,
            paymentDetails = new
            {
                razorpayPaymentId = request.PaymentId,
                razorpayOrderId = request.RazorpayOrderId,
                amount = request.TotalLandingCost
            }
        };
    }
}