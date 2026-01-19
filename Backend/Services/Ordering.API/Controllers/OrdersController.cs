using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Ordering.API.Services;
using Ordering.API.Models;
using Ordering.API.DTOs;

namespace Ordering.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[AllowAnonymous] // Temporarily allow anonymous for testing
public class OrdersController : ControllerBase
{
    private readonly IOrderService _orderService;
    private readonly IPaymentService _paymentService;
    private readonly ICartService _cartService;

    public OrdersController(IOrderService orderService, IPaymentService paymentService, ICartService cartService)
    {
        _orderService = orderService;
        _paymentService = paymentService;
        _cartService = cartService;
    }

    [HttpPost]
    public async Task<IActionResult> CreateOrder([FromBody] CreateOrderRequest request)
    {
        var buyerId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (buyerId == null)
            buyerId = "test-buyer-001"; // Dev testing fallback

        var order = await _orderService.CreateOrderAsync(buyerId, request);
        await _cartService.ClearCartAsync(buyerId);

        return CreatedAtAction(nameof(GetOrder), new { id = order.Id }, order);
    }

    /// <summary>
    /// Unified Cart Checkout - Creates Master Order and splits into vendor sub-orders
    /// </summary>
    [HttpPost("checkout")]
    public async Task<IActionResult> CheckoutUnifiedCart([FromBody] CreateOrderRequest request)
    {
        var buyerId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (buyerId == null)
            buyerId = "test-buyer-001"; // Dev testing fallback

        // Step A: Create Master Order with total payment
        var order = await _orderService.CreateOrderAsync(buyerId, request);
        
        // Step B: Order Splitting happens in CreateOrderAsync:
        // - OrderItems are created for each vendor
        // - Each OrderItem has IsReadyForPickup = false
        // - BroadcastPickupRequestsAsync notifies each vendor
        
        // Clear cart after successful order
        await _cartService.ClearCartAsync(buyerId);

        // Get vendor breakdown for response
        var vendorGroups = order.OrderItems.GroupBy(oi => oi.VendorId);
        var vendorSummary = vendorGroups.Select(g => new 
        {
            vendorId = g.Key,
            itemCount = g.Count(),
            totalQuantity = g.Sum(i => i.Quantity),
            subtotal = g.Sum(i => i.TotalPrice),
            items = g.Select(i => new 
            {
                productName = i.ProductName,
                quantity = $"{i.Quantity}kg",
                isReady = i.IsReadyForPickup
            }).ToList()
        }).ToList();

        return Ok(new 
        {
            success = true,
            message = $"✓ Order placed! {vendorGroups.Count()} vendors notified.",
            order = new 
            {
                id = order.Id,
                orderNumber = order.OrderNumber,
                status = order.Status.ToString(),
                totalAmount = order.TotalAmount,
                breakdown = new 
                {
                    produceTotal = order.ProduceTotal,
                    logisticsFee = order.LogisticsFee,
                    serviceFee = order.ServiceFee
                },
                escrow = new 
                {
                    isEscrow = order.IsEscrow,
                    status = order.EscrowStatus.ToString()
                },
                deliveryAddress = order.DeliveryAddress,
                createdAt = order.CreatedAt
            },
            vendors = vendorSummary,
            nextSteps = new 
            {
                buyer = "Track order progress. Delivery expected within 2-4 hours.",
                vendors = "Each vendor will mark items ready when packed.",
                transporter = "Will be assigned automatically once all vendors are ready."
            }
        });
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetOrder(int id)
    {
        var order = await _orderService.GetOrderByIdAsync(id);
        if (order == null)
            return NotFound();

        return Ok(order);
    }

    [HttpGet("my-orders")]
    public async Task<IActionResult> GetMyOrders()
    {
        var buyerId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (buyerId == null)
            return Unauthorized();

        var orders = await _orderService.GetBuyerOrdersAsync(buyerId);
        return Ok(orders);
    }

    [Authorize(Roles = "Vendor")]
    [HttpGet("vendor-orders")]
    public async Task<IActionResult> GetVendorOrders()
    {
        var vendorId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (vendorId == null)
            return Unauthorized();

        var orders = await _orderService.GetVendorOrdersAsync(vendorId);
        return Ok(orders);
    }

    [HttpPost("{id}/initiate-payment")]
    public async Task<IActionResult> InitiatePayment(int id)
    {
        var order = await _orderService.GetOrderByIdAsync(id);
        if (order == null)
            return NotFound();

        var transactionId = await _paymentService.InitiatePaymentAsync(id, order.TotalAmount);
        return Ok(new { transactionId, amount = order.TotalAmount });
    }

    [HttpPost("capture-payment/{transactionId}")]
    public async Task<IActionResult> CapturePayment(string transactionId)
    {
        var success = await _paymentService.CapturePaymentAsync(transactionId);
        if (!success)
            return BadRequest(new { message = "Payment capture failed" });

        return Ok(new { message = "Payment captured successfully" });
    }

    /// <summary>
    /// Create Razorpay Payment Order
    /// </summary>
    [HttpPost("create-payment-order")]
    public async Task<IActionResult> CreatePaymentOrder([FromBody] CreateOrderRequest request)
    {
        try
        {
            var amountInPaise = (int)(request.TotalLandingCost * 100);
            
            // Create Razorpay order (mock for now - integrate with actual Razorpay SDK)
            var razorpayOrderId = $"order_{Guid.NewGuid().ToString("N").Substring(0, 14)}";
            
            return Ok(new
            {
                razorpayOrderId = razorpayOrderId,
                amount = amountInPaise,
                currency = "INR",
                key = "rzp_test_YOUR_KEY_ID" // Should be from config
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = "Failed to create payment order", error = ex.Message });
        }
    }

    /// <summary>
    /// Complete Payment and Create Parent/Child Orders
    /// Phase A: Database Split - Parent Order (Paid) + Child Orders (Awaiting Packing)
    /// </summary>
    [HttpPost("complete-payment")]
    public async Task<IActionResult> CompletePayment([FromBody] CompletePaymentRequest request)
    {
        try
        {
            var buyerId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (buyerId == null)
                buyerId = "test-buyer-001"; // Dev testing fallback

            // Verify payment signature (in production, verify with Razorpay)
            // For now, we trust the frontend callback

            // PHASE A: Create Parent Order with Status = Paid
            var parentOrder = new Order
            {
                BuyerId = buyerId,
                OrderNumber = $"PO-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString("N").Substring(0, 6).ToUpper()}",
                TotalAmount = request.TotalLandingCost,
                ProduceTotal = request.ProduceTotal,
                LogisticsFee = request.LogisticsFee,
                ServiceFee = request.ServiceFee,
                Status = OrderStatus.PaymentReceived, // PAID STATUS
                DeliveryAddress = request.DeliveryAddress,
                PaymentMethod = request.PaymentMethod,
                PaymentId = request.PaymentId,
                RazorpayOrderId = request.RazorpayOrderId,
                IsEscrow = false,
                CreatedAt = DateTime.UtcNow,
                OrderItems = new List<OrderItem>()
            };

            // Group items by vendor for child orders
            var vendorGroups = request.Items.GroupBy(i => i.VendorId);
            var childOrders = new List<object>();

            foreach (var vendorGroup in vendorGroups)
            {
                var vendorId = vendorGroup.Key;
                var vendorItems = vendorGroup.ToList();
                
                // Add items to parent order with Awaiting Packing status
                foreach (var item in vendorItems)
                {
                    parentOrder.OrderItems.Add(new OrderItem
                    {
                        ProductId = item.ProductId,
                        ProductName = item.ProductName,
                        VendorId = vendorId,
                        Quantity = item.Quantity,
                        UnitPrice = item.UnitPrice,
                        TotalPrice = item.Quantity * item.UnitPrice,
                        IsReadyForPickup = false, // Awaiting Packing
                        Status = "AwaitingPacking"
                    });
                }

                // Prepare child order summary for response
                childOrders.Add(new
                {
                    vendorId = vendorId,
                    vendorName = $"Vendor {vendorId}",
                    orderNumber = $"CO-{DateTime.UtcNow:yyyyMMdd}-{vendorId.Substring(0, 4)}-{Guid.NewGuid().ToString("N").Substring(0, 4).ToUpper()}",
                    itemCount = vendorItems.Count,
                    totalQuantity = vendorItems.Sum(i => i.Quantity),
                    subtotal = vendorItems.Sum(i => i.Quantity * i.UnitPrice),
                    status = "AwaitingPacking",
                    items = vendorItems.Select(i => new
                    {
                        productName = i.ProductName,
                        quantity = i.Quantity,
                        unitPrice = i.UnitPrice
                    }).ToList()
                });
            }

            // Save parent order to database
            var createdOrder = await _orderService.CreateOrderAsync(buyerId, new CreateOrderRequest
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

            // Update order with payment details
            createdOrder.PaymentId = request.PaymentId;
            createdOrder.RazorpayOrderId = request.RazorpayOrderId;
            createdOrder.Status = OrderStatus.PaymentReceived;

            // Clear cart
            await _cartService.ClearCartAsync(buyerId);

            // TODO: Send notifications to vendors
            // await _notificationService.NotifyVendors(childOrders);

            return Ok(new
            {
                success = true,
                message = "Payment successful! Order split completed.",
                parentOrder = new
                {
                    id = createdOrder.Id,
                    orderNumber = createdOrder.OrderNumber,
                    status = "Paid",
                    totalAmount = createdOrder.TotalAmount,
                    paymentId = request.PaymentId
                },
                childOrders = childOrders,
                paymentDetails = new
                {
                    razorpayPaymentId = request.PaymentId,
                    razorpayOrderId = request.RazorpayOrderId,
                    amount = request.TotalLandingCost
                }
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = "Payment processing failed", error = ex.Message });
        }
    }

    [Authorize(Roles = "Vendor")]
    [HttpPut("{id}/status")]
    public async Task<IActionResult> UpdateOrderStatus(int id, [FromQuery] string status)
    {
        if (!Enum.TryParse<OrderStatus>(status, out var orderStatus))
            return BadRequest(new { message = "Invalid status" });

        var success = await _orderService.UpdateOrderStatusAsync(id, orderStatus);
        if (!success)
            return NotFound();

        return Ok(new { message = "Order status updated" });
    }

    [Authorize(Roles = "Transporter")]
    [HttpPut("{id}/assign-transporter")]
    public async Task<IActionResult> AssignTransporter(int id)
    {
        var transporterId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (transporterId == null)
            return Unauthorized();

        var success = await _orderService.AssignTransporterAsync(id, transporterId);
        if (!success)
            return NotFound();

        return Ok(new { message = "Transporter assigned" });
    }
    
    [Authorize(Roles = "Vendor")]
    [HttpPost("{id}/mark-ready")]
    public async Task<IActionResult> MarkItemsReady(int id)
    {
        var vendorId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (vendorId == null)
            return Unauthorized();

        var success = await _orderService.MarkVendorItemsReadyAsync(id, vendorId);
        if (!success)
            return NotFound(new { message = "Order not found or no items for this vendor" });

        return Ok(new { message = "Items marked ready for pickup", vendorId });
    }
    
    [Authorize(Roles = "Buyer")]
    [HttpPost("{id}/confirm-delivery")]
    public async Task<IActionResult> ConfirmDelivery(int id)
    {
        var buyerId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (buyerId == null)
            return Unauthorized();

        var success = await _orderService.ConfirmDeliveryAsync(id, buyerId);
        if (!success)
            return BadRequest(new { message = "Delivery confirmation failed. Order must be InTransit." });

        var order = await _orderService.GetOrderByIdAsync(id);
        
        return Ok(new 
        { 
            message = "✓ Delivery confirmed ✓ Escrow released",
            deliveryQRCode = order?.DeliveryQRCode,
            payouts = new 
            {
                vendors = order?.Payment?.VendorPayout,
                transporter = order?.Payment?.TransporterPayout,
                platform = order?.Payment?.PlatformCommission
            }
        });
    }}