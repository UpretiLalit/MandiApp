using MediatR;
using Ordering.Application.DTOs;

namespace Ordering.Application.Queries.GetBuyerOrders;

public class GetBuyerOrdersQuery : IRequest<List<OrderDto>>
{
    public Guid BuyerId { get; set; }

    public GetBuyerOrdersQuery(Guid buyerId)
    {
        BuyerId = buyerId;
    }
}
