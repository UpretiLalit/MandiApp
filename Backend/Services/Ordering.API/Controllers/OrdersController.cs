using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Ordering.API.Services;
using Ordering.API.DTOs;

namespace Ordering.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[AllowAnonymous]
public class OrdersController : ControllerBase
{
    private readonly IOrderService _orderService;
    private readonly IPaymentService _paymentService;
    private readonly ILogger<OrdersController> _logger;

    public OrdersController(IOrderService orderService, IPaymentService paymentService, ILogger<OrdersController> logger)
    {
        _orderService = orderService;
        _paymentService = paymentService;
        _logger = logger;
    }

    [HttpPost]
    public async Task<IActionResult> CreateOrder([FromBody] CreateOrderRequest request)
    {
        try
        {
            var buyerId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "test-buyer-001";
            var order = await _orderService.CreateOrderAsync(buyerId, request);
            return CreatedAtAction(nameof(GetOrder), new { id = order.Id }, order);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating order");
            return BadRequest(new { message = "Order creation failed", error = ex.Message });
        }
    }

    [HttpPost("checkout")]
    public async Task<IActionResult> CheckoutUnifiedCart([FromBody] CreateOrderRequest request)
    {
        try
        {
            var buyerId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "test-buyer-001";
            var order = await _orderService.CreateOrderAsync(buyerId, request);
            return Ok(order);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during checkout");
            return BadRequest(new { message = "Checkout failed", error = ex.Message });
        }
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
        var result = await _paymentService.InitiatePaymentAsync(id);
        if (result == null)
            return NotFound("Order not found");
            
        return Ok(result);
    }

    [HttpPost("capture-payment/{transactionId}")]
    public async Task<IActionResult> CapturePayment(string transactionId)
    {
        var result = await _paymentService.CapturePaymentAsync(transactionId);
        return result ? Ok(new { message = "Payment captured successfully" }) : BadRequest("Payment capture failed");
    }

    [HttpPost("create-payment-order")]
    public async Task<IActionResult> CreatePaymentOrder([FromBody] CreateOrderRequest request)
    {
        var result = await _orderService.CreatePaymentOrderAsync(request);
        return Ok(result);
    }

    [HttpPost("complete-payment")]
    public async Task<IActionResult> CompletePayment([FromBody] CompletePaymentRequest request)
    {
        try
        {
            var buyerId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "test-buyer-001";
            var result = await _orderService.CompletePaymentAsync(buyerId, request);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error completing payment");
            return BadRequest(new { message = "Payment processing failed", error = ex.Message });
        }
    }

    [Authorize(Roles = "Vendor")]
    [HttpPut("{id}/status")]
    public async Task<IActionResult> UpdateOrderStatus(int id, [FromQuery] string status)
    {
        if (!Enum.TryParse<Models.OrderStatus>(status, out var orderStatus))
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
        var vendorId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "vendor-001";
        var success = await _orderService.MarkVendorItemsReadyAsync(id, vendorId);
        if (!success)
            return NotFound(new { message = "Order not found or no items for this vendor" });

        var order = await _orderService.GetOrderByIdAsync(id);
        var allVendorsReady = order!.OrderItems.All(item => item.IsReadyForPickup);

        if (allVendorsReady)
        {
            return Ok(new { 
                message = "All vendors ready! Transporter notified.",
                vendorId,
                allReady = true
            });
        }

        return Ok(new { 
            message = "Items marked ready for pickup", 
            vendorId,
            waitingForOtherVendors = true
        });
    }
    
    [HttpGet("transporter-jobs")]
    public async Task<IActionResult> GetTransporterJobs()
    {
        var jobs = await _orderService.GetTransporterJobsAsync();
        return Ok(jobs);
    }
    
    [HttpPost("transporter-jobs/{orderId}/accept")]
    public async Task<IActionResult> AcceptTransporterJob(int orderId)
    {
        var transporterId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "transporter-001";
        var success = await _orderService.AcceptTransporterJobAsync(orderId, transporterId);
        
        if (!success)
            return BadRequest(new { message = "Job already assigned or order not found" });

        var order = await _orderService.GetOrderByIdAsync(orderId);
        return Ok(new { 
            message = "Job accepted successfully",
            orderNumber = order!.OrderNumber,
            transporterId
        });
    }
    
    [HttpPut("{id}/demo-status")]
    public async Task<IActionResult> UpdateOrderStatusForDemo(int id, [FromBody] UpdateStatusRequest request)
    {
        if (!Enum.TryParse<Models.OrderStatus>(request.Status, true, out var newStatus))
            return BadRequest(new { message = "Invalid status" });

        var success = await _orderService.UpdateOrderStatusAsync(id, newStatus);
        if (!success)
            return NotFound(new { message = "Order not found" });

        var order = await _orderService.GetOrderByIdAsync(id);
        return Ok(new { 
            message = $"Order status updated to {newStatus}",
            orderNumber = order!.OrderNumber,
            status = order.Status.ToString()
        });
    }
    
    [HttpPost("{id}/confirm-delivery")]
    public async Task<IActionResult> ConfirmDelivery(int id)
    {
        var buyerId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "test-buyer-001";
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
    }
}
