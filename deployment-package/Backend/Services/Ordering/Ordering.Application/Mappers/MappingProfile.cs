using AutoMapper;
using Ordering.Application.DTOs;
using Ordering.Domain.Aggregates.OrderAggregate;

namespace Ordering.Application.Mappers;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        // Order mappings
        CreateMap<Order, OrderDto>()
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()))
            .ForMember(dest => dest.BuyerPhone, opt => opt.MapFrom(src => src.BuyerPhone.Number))
            .ForMember(dest => dest.Street, opt => opt.MapFrom(src => src.DeliveryAddress.Street))
            .ForMember(dest => dest.City, opt => opt.MapFrom(src => src.DeliveryAddress.City))
            .ForMember(dest => dest.State, opt => opt.MapFrom(src => src.DeliveryAddress.State))
            .ForMember(dest => dest.Pincode, opt => opt.MapFrom(src => src.DeliveryAddress.Pincode))
            .ForMember(dest => dest.Latitude, opt => opt.MapFrom(src => src.DeliveryAddress.Latitude))
            .ForMember(dest => dest.Longitude, opt => opt.MapFrom(src => src.DeliveryAddress.Longitude))
            .ForMember(dest => dest.TotalAmount, opt => opt.MapFrom(src => src.TotalAmount.Amount))
            .ForMember(dest => dest.LogisticsFee, opt => opt.MapFrom(src => src.LogisticsFee.Amount))
            .ForMember(dest => dest.ServiceFee, opt => opt.MapFrom(src => src.ServiceFee.Amount))
            .ForMember(dest => dest.GrandTotal, opt => opt.MapFrom(src => src.GrandTotal.Amount))
            .ForMember(dest => dest.Currency, opt => opt.MapFrom(src => src.GrandTotal.Currency))
            .ForMember(dest => dest.Items, opt => opt.MapFrom(src => src.Items));

        // OrderItem mappings
        CreateMap<OrderItem, OrderItemDto>()
            .ForMember(dest => dest.UnitPrice, opt => opt.MapFrom(src => src.UnitPrice.Amount))
            .ForMember(dest => dest.Currency, opt => opt.MapFrom(src => src.UnitPrice.Currency))
            .ForMember(dest => dest.TotalPrice, opt => opt.MapFrom(src => src.TotalPrice.Amount));
    }
}
