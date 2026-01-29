using Microsoft.EntityFrameworkCore;
using Marketplace.API.Data;
using Marketplace.API.Models;

namespace Marketplace.API.Services;

public class PriceService : IPriceService
{
    private readonly MarketplaceDbContext _context;

    public PriceService(MarketplaceDbContext context)
    {
        _context = context;
    }

    public async Task<bool> UpdatePriceAsync(int productId, decimal newPrice, string vendorId)
    {
        var product = await _context.Products.FirstOrDefaultAsync(p => p.Id == productId && p.VendorId == vendorId);
        if (product == null)
            return false;

        product.CurrentPrice = newPrice;
        product.UpdatedAt = DateTime.UtcNow;

        var priceHistory = new PriceHistory
        {
            ProductId = productId,
            Price = newPrice,
            ChangedBy = vendorId
        };

        _context.PriceHistories.Add(priceHistory);
        await _context.SaveChangesAsync();

        return true;
    }

    public async Task<IEnumerable<object>> GetPriceHistoryAsync(int productId)
    {
        return await _context.PriceHistories
            .Where(ph => ph.ProductId == productId)
            .OrderByDescending(ph => ph.ChangedAt)
            .Take(50)
            .Select(ph => new
            {
                ph.Id,
                ph.Price,
                ph.ChangedAt,
                ph.ChangedBy
            })
            .ToListAsync();
    }
}
