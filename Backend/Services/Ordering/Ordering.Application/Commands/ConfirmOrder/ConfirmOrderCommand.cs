using MediatR;
using Ordering.Application.DTOs;

namespace Ordering.Application.Commands.ConfirmOrder;

public class ConfirmOrderCommand : IRequest<OrderDto>
{
    public Guid OrderId { get; set; }
}
