namespace Marketplace.API.DTOs;

public record CreateProductRequest(
    string Name,
    string Category,
    string Description,
    string Unit,
    decimal Price,
    int Quantity,
    string? ImageUrl = null
);

public record UpdateProductRequest(
    string? Name = null,
    string? Description = null,
    int? Quantity = null,
    string? ImageUrl = null,
    bool? IsActive = null
);

public record QuickPriceUpdateRequest(
    int ProductId,
    decimal NewPrice
);
