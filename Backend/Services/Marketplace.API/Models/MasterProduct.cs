namespace Marketplace.API.Models;

public class MasterProduct
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = string.Empty;
    public string? NameHindi { get; set; }
    public string Category { get; set; } = string.Empty; // Vegetable, Fruit, Grain
    public string? SubCategory { get; set; }
    public string? Description { get; set; }
    public string Unit { get; set; } = "kg";
    public List<string> ImageUrls { get; set; } = new();
    public bool IsLive { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

public class MasterProductDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? NameHindi { get; set; }
    public string Category { get; set; } = string.Empty;
    public string? SubCategory { get; set; }
    public string? Description { get; set; }
    public string Unit { get; set; } = "kg";
    public List<string> ImageUrls { get; set; } = new();
    public bool IsLive { get; set; }
}

public class AddProductFromMasterRequest
{
    public Guid MasterProductId { get; set; }
    public decimal Price { get; set; }
    public int Stock { get; set; }
    public bool IsLive { get; set; } = false;
}
