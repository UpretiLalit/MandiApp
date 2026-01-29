namespace Marketplace.API.DTOs;

public record CreateProductRequest(
    string Name,
    string Category,
    string Grade,
    string Description,
    string Unit,
    decimal Price,
    int Quantity,
    int MinOrderQty,
    string? ImageUrl = null,
    string? Emoji = null,
    List<PriceTier>? PriceTiers = null
);

public record PriceTier(
    int MinQty,
    int MaxQty,
    decimal Price
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
