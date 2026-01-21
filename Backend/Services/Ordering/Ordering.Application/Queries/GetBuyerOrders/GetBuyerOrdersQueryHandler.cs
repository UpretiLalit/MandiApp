using AutoMapper;
using MediatR;
using Ordering.Application.DTOs;
using Ordering.Domain.Repositories;

namespace Ordering.Application.Queries.GetBuyerOrders;

public class GetBuyerOrdersQueryHandler : IRequestHandler<GetBuyerOrdersQuery, List<OrderDto>>
{
    private readonly IOrderRepository _orderRepository;
    private readonly IMapper _mapper;

    public GetBuyerOrdersQueryHandler(IOrderRepository orderRepository, IMapper mapper)
    {
        _orderRepository = orderRepository;
        _mapper = mapper;
    }

    public async Task<List<OrderDto>> Handle(GetBuyerOrdersQuery request, CancellationToken cancellationToken)
    {
        var orders = await _orderRepository.GetByBuyerIdAsync(request.BuyerId, cancellationToken);
        
        return _mapper.Map<List<OrderDto>>(orders);
    }
}
