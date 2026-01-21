using FluentValidation;

namespace Ordering.Application.Commands.CreateOrder;

public class CreateOrderCommandValidator : AbstractValidator<CreateOrderCommand>
{
    public CreateOrderCommandValidator()
    {
        RuleFor(x => x.BuyerId)
            .NotEmpty().WithMessage("Buyer ID is required");

        RuleFor(x => x.BuyerPhone)
            .NotEmpty().WithMessage("Buyer phone is required")
            .Matches(@"^[6-9]\d{9}$").WithMessage("Invalid Indian phone number");

        RuleFor(x => x.Street)
            .NotEmpty().WithMessage("Street is required")
            .MaximumLength(200).WithMessage("Street cannot exceed 200 characters");

        RuleFor(x => x.City)
            .NotEmpty().WithMessage("City is required")
            .MaximumLength(100).WithMessage("City cannot exceed 100 characters");

        RuleFor(x => x.State)
            .NotEmpty().WithMessage("State is required")
            .MaximumLength(100).WithMessage("State cannot exceed 100 characters");

        RuleFor(x => x.Pincode)
            .NotEmpty().WithMessage("Pincode is required")
            .Matches(@"^\d{6}$").WithMessage("Pincode must be 6 digits");

        RuleFor(x => x.Items)
            .NotEmpty().WithMessage("Order must have at least one item")
            .Must(items => items.Count > 0).WithMessage("Order must have at least one item");

        RuleForEach(x => x.Items).ChildRules(item =>
        {
            item.RuleFor(x => x.ProductId)
                .NotEmpty().WithMessage("Product ID is required");

            item.RuleFor(x => x.ProductName)
                .NotEmpty().WithMessage("Product name is required")
                .MaximumLength(200).WithMessage("Product name cannot exceed 200 characters");

            item.RuleFor(x => x.UnitPrice)
                .GreaterThan(0).WithMessage("Unit price must be greater than 0");

            item.RuleFor(x => x.Quantity)
                .GreaterThan(0).WithMessage("Quantity must be greater than 0");
        });
    }
}
