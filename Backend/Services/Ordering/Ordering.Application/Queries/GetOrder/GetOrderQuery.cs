using MediatR;
using Ordering.Application.DTOs;

namespace Ordering.Application.Queries.GetOrder;

public class GetOrderQuery : IRequest<OrderDto?>
{
    public Guid OrderId { get; set; }

    public GetOrderQuery(Guid orderId)
    {
        OrderId = orderId;
    }
}
