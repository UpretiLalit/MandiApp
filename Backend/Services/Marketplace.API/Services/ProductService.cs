using Microsoft.EntityFrameworkCore;
using Marketplace.API.Data;
using Marketplace.API.Models;
using Marketplace.API.DTOs;

namespace Marketplace.API.Services;

public class ProductService : IProductService
{
    private readonly MarketplaceDbContext _context;

    public ProductService(MarketplaceDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Product>> GetAllProductsAsync(string? category = null)
    {
        var query = _context.Products.Where(p => p.IsActive);

        if (!string.IsNullOrEmpty(category))
            query = query.Where(p => p.Category == category);

        return await query.OrderByDescending(p => p.UpdatedAt).ToListAsync();
    }

    public async Task<Product?> GetProductByIdAsync(int id)
    {
        return await _context.Products
            .Include(p => p.PriceHistory.OrderByDescending(ph => ph.ChangedAt).Take(10))
            .FirstOrDefaultAsync(p => p.Id == id);
    }

    public async Task<IEnumerable<Product>> GetVendorProductsAsync(string vendorId)
    {
        return await _context.Products
            .Where(p => p.VendorId == vendorId)
            .OrderByDescending(p => p.UpdatedAt)
            .ToListAsync();
    }

    public async Task<Product> CreateProductAsync(CreateProductRequest request, string vendorId)
    {
        var product = new Product
        {
            VendorId = vendorId,
            Name = request.Name,
            Category = request.Category,
            Description = request.Description,
            Unit = request.Unit,
            CurrentPrice = request.Price,
            AvailableQuantity = request.Quantity,
            ImageUrl = request.ImageUrl,
            IsActive = true
        };

        _context.Products.Add(product);
        await _context.SaveChangesAsync();

        // Add initial price history
        var priceHistory = new PriceHistory
        {
            ProductId = product.Id,
            Price = product.CurrentPrice,
            ChangedBy = vendorId
        };
        _context.PriceHistories.Add(priceHistory);
        await _context.SaveChangesAsync();

        return product;
    }

    public async Task<Product?> UpdateProductAsync(int id, UpdateProductRequest request, string vendorId)
    {
        var product = await _context.Products.FirstOrDefaultAsync(p => p.Id == id && p.VendorId == vendorId);
        if (product == null)
            return null;

        if (request.Name != null) product.Name = request.Name;
        if (request.Description != null) product.Description = request.Description;
        if (request.Quantity.HasValue) product.AvailableQuantity = request.Quantity.Value;
        if (request.ImageUrl != null) product.ImageUrl = request.ImageUrl;
        if (request.IsActive.HasValue) product.IsActive = request.IsActive.Value;

        product.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return product;
    }

    public async Task<bool> DeleteProductAsync(int id, string vendorId)
    {
        var product = await _context.Products.FirstOrDefaultAsync(p => p.Id == id && p.VendorId == vendorId);
        if (product == null)
            return false;

        product.IsActive = false;
        await _context.SaveChangesAsync();
        return true;
    }
}
