using MediatR;
using Ordering.Application.DTOs;

namespace Ordering.Application.Commands.CreateOrder;

public class CreateOrderCommand : IRequest<OrderDto>
{
    public Guid BuyerId { get; set; }
    public string BuyerPhone { get; set; } = string.Empty;
    
    // Address
    public string Street { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string State { get; set; } = string.Empty;
    public string Pincode { get; set; } = string.Empty;
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
    
    // Items
    public List<CreateOrderItemDto> Items { get; set; } = new();
}

public class CreateOrderItemDto
{
    public Guid ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public decimal UnitPrice { get; set; }
    public int Quantity { get; set; }
}
