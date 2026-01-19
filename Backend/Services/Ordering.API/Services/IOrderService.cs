using Ordering.API.Models;
using Ordering.API.DTOs;

namespace Ordering.API.Services;

public interface IOrderService
{
    Task<Order> CreateOrderAsync(string buyerId, CreateOrderRequest request);
    Task<Order?> GetOrderByIdAsync(int orderId);
    Task<IEnumerable<Order>> GetBuyerOrdersAsync(string buyerId);
    Task<IEnumerable<Order>> GetVendorOrdersAsync(string vendorId);
    Task<bool> UpdateOrderStatusAsync(int orderId, OrderStatus status);
    Task<bool> AssignTransporterAsync(int orderId, string transporterId);
    Task<bool> MarkVendorItemsReadyAsync(int orderId, string vendorId);
    Task<bool> ConfirmDeliveryAsync(int orderId, string buyerId);}