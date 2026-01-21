using AutoMapper;
using MediatR;
using Ordering.Application.DTOs;
using Ordering.Domain.Aggregates.OrderAggregate;
using Ordering.Domain.DomainServices;
using Ordering.Domain.Repositories;
using Ordering.Domain.ValueObjects;

namespace Ordering.Application.Commands.CreateOrder;

public class CreateOrderCommandHandler : IRequestHandler<CreateOrderCommand, OrderDto>
{
    private readonly IOrderRepository _orderRepository;
    private readonly OrderPricingService _pricingService;
    private readonly IMapper _mapper;

    public CreateOrderCommandHandler(
        IOrderRepository orderRepository,
        OrderPricingService pricingService,
        IMapper mapper)
    {
        _orderRepository = orderRepository;
        _pricingService = pricingService;
        _mapper = mapper;
    }

    public async Task<OrderDto> Handle(CreateOrderCommand request, CancellationToken cancellationToken)
    {
        // Create value objects
        var phoneNumber = PhoneNumber.Create(request.BuyerPhone);
        var address = Address.Create(
            request.Street,
            request.City,
            request.State,
            request.Pincode,
            request.Latitude,
            request.Longitude);

        // Create order aggregate
        var order = Order.Create(request.BuyerId, phoneNumber, address);

        // Add items to order
        foreach (var item in request.Items)
        {
            var unitPrice = Money.Create(item.UnitPrice);
            order.AddItem(item.ProductId, item.ProductName, unitPrice, item.Quantity);
        }

        // Calculate fees using domain service (use default distance and weight for now)
        var distanceKm = address.HasCoordinates() ? 10.0 : 10.0; // TODO: Calculate actual distance from vendor
        var weightKg = 5.0; // TODO: Calculate from product weight
        var (logisticsFee, serviceFee) = _pricingService.CalculateFees(order, distanceKm, weightKg);
        order.SetFees(logisticsFee, serviceFee);

        // Save to repository
        var createdOrder = await _orderRepository.AddAsync(order, cancellationToken);
        await _orderRepository.SaveChangesAsync(cancellationToken);

        // Map to DTO and return
        return _mapper.Map<OrderDto>(createdOrder);
    }
}
