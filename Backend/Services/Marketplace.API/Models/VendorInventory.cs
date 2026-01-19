namespace Marketplace.API.Models;

public class VendorInventory
{
    public int Id { get; set; }
    public string VendorId { get; set; } = string.Empty;
    public int ProductId { get; set; }
    public int Quantity { get; set; }
    public string Location { get; set; } = string.Empty;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public Product Product { get; set; } = null!;
}
