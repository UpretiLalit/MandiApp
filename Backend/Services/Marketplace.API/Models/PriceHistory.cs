using System.Text.Json.Serialization;

namespace Marketplace.API.Models;

public class PriceHistory
{
    public int Id { get; set; }
    public int ProductId { get; set; }
    public decimal Price { get; set; }
    public DateTime ChangedAt { get; set; } = DateTime.UtcNow;
    public string ChangedBy { get; set; } = string.Empty; // VendorId

    // Navigation
    [JsonIgnore]
    public Product Product { get; set; } = null!;
}
