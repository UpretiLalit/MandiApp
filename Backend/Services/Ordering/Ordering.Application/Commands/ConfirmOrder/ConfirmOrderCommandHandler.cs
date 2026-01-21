using AutoMapper;
using MediatR;
using Ordering.Application.DTOs;
using Ordering.Domain.Repositories;

namespace Ordering.Application.Commands.ConfirmOrder;

public class ConfirmOrderCommandHandler : IRequestHandler<ConfirmOrderCommand, OrderDto>
{
    private readonly IOrderRepository _orderRepository;
    private readonly IMapper _mapper;

    public ConfirmOrderCommandHandler(IOrderRepository orderRepository, IMapper mapper)
    {
        _orderRepository = orderRepository;
        _mapper = mapper;
    }

    public async Task<OrderDto> Handle(ConfirmOrderCommand request, CancellationToken cancellationToken)
    {
        var order = await _orderRepository.GetByIdAsync(request.OrderId, cancellationToken);
        
        if (order == null)
            throw new InvalidOperationException($"Order {request.OrderId} not found");

        order.Confirm();
        
        await _orderRepository.UpdateAsync(order, cancellationToken);
        await _orderRepository.SaveChangesAsync(cancellationToken);

        return _mapper.Map<OrderDto>(order);
    }
}
