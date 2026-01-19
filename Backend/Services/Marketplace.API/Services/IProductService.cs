using Marketplace.API.Models;
using Marketplace.API.DTOs;

namespace Marketplace.API.Services;

public interface IProductService
{
    Task<IEnumerable<Product>> GetAllProductsAsync(string? category = null);
    Task<Product?> GetProductByIdAsync(int id);
    Task<IEnumerable<Product>> GetVendorProductsAsync(string vendorId);
    Task<Product> CreateProductAsync(CreateProductRequest request, string vendorId);
    Task<Product?> UpdateProductAsync(int id, UpdateProductRequest request, string vendorId);
    Task<bool> DeleteProductAsync(int id, string vendorId);
}
