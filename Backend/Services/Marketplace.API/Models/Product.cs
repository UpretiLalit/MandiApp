using System.Text.Json.Serialization;

namespace Marketplace.API.Models;

public class Product
{
    public int Id { get; set; }
    public string VendorId { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Unit { get; set; } = string.Empty; // kg, quintal, ton
    public decimal CurrentPrice { get; set; }
    public int AvailableQuantity { get; set; }
    public int MinOrderQty { get; set; } = 1; // Minimum order quantity
    public string? ImageUrl { get; set; }
    public string? Emoji { get; set; } // 🍅, 🧅, 🥔, etc.
    public string? Grade { get; set; } // A, B, C
    public string? PriceTiersJson { get; set; } // JSON string for tiered pricing
    public bool IsActive { get; set; } = true;
    public bool IsLive { get; set; } = false; // Vendor controls if product is live
    public Guid? MasterProductId { get; set; } // Link to master product catalog
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    [JsonIgnore]
    public ICollection<PriceHistory> PriceHistory { get; set; } = new List<PriceHistory>();
    
    [JsonIgnore]
    public MasterProduct? MasterProduct { get; set; }
}
