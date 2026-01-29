using AutoMapper;
using MediatR;
using Ordering.Application.DTOs;
using Ordering.Domain.Repositories;

namespace Ordering.Application.Queries.GetOrder;

public class GetOrderQueryHandler : IRequestHandler<GetOrderQuery, OrderDto?>
{
    private readonly IOrderRepository _orderRepository;
    private readonly IMapper _mapper;

    public GetOrderQueryHandler(IOrderRepository orderRepository, IMapper mapper)
    {
        _orderRepository = orderRepository;
        _mapper = mapper;
    }

    public async Task<OrderDto?> Handle(GetOrderQuery request, CancellationToken cancellationToken)
    {
        var order = await _orderRepository.GetByIdAsync(request.OrderId, cancellationToken);
        
        return order == null ? null : _mapper.Map<OrderDto>(order);
    }
}
