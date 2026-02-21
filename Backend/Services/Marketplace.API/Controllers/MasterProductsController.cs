using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Marketplace.API.Data;
using Marketplace.API.Models;

namespace Marketplace.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MasterProductsController : ControllerBase
{
    private readonly MarketplaceDbContext _context;
    private readonly ILogger<MasterProductsController> _logger;

    public MasterProductsController(MarketplaceDbContext context, ILogger<MasterProductsController> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Get all master products (vegetables, fruits, grains)
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string? category = null, [FromQuery] string? search = null)
    {
        try
        {
            var query = _context.MasterProducts.AsQueryable();

            if (!string.IsNullOrEmpty(category))
            {
                query = query.Where(p => p.Category.ToLower() == category.ToLower());
            }

            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(p => 
                    p.Name.ToLower().Contains(search.ToLower()) || 
                    (p.NameHindi != null && p.NameHindi.Contains(search)));
            }

            var products = await query
                .OrderBy(p => p.Category)
                .ThenBy(p => p.Name)
                .Select(p => new MasterProductDto
                {
                    Id = p.Id,
                    Name = p.Name,
                    NameHindi = p.NameHindi,
                    Category = p.Category,
                    SubCategory = p.SubCategory,
                    Description = p.Description,
                    Unit = p.Unit,
                    ImageUrls = p.ImageUrls
                })
                .ToListAsync();

            return Ok(new { products, count = products.Count });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching master products");
            return StatusCode(500, new { message = "Error fetching products", error = ex.Message });
        }
    }

    /// <summary>
    /// Get master products by category
    /// </summary>
    [HttpGet("category/{category}")]
    public async Task<IActionResult> GetByCategory(string category)
    {
        try
        {
            var products = await _context.MasterProducts
                .Where(p => p.Category.ToLower() == category.ToLower())
                .OrderBy(p => p.SubCategory)
                .ThenBy(p => p.Name)
                .Select(p => new MasterProductDto
                {
                    Id = p.Id,
                    Name = p.Name,
                    NameHindi = p.NameHindi,
                    Category = p.Category,
                    SubCategory = p.SubCategory,
                    Description = p.Description,
                    Unit = p.Unit,
                    ImageUrls = p.ImageUrls
                })
                .ToListAsync();

            return Ok(new { products, count = products.Count });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching products by category");
            return StatusCode(500, new { message = "Error fetching products", error = ex.Message });
        }
    }

    /// <summary>
    /// Get a single master product by ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        try
        {
            var product = await _context.MasterProducts
                .Where(p => p.Id == id)
                .Select(p => new MasterProductDto
                {
                    Id = p.Id,
                    Name = p.Name,
                    NameHindi = p.NameHindi,
                    Category = p.Category,
                    SubCategory = p.SubCategory,
                    Description = p.Description,
                    Unit = p.Unit,
                    ImageUrls = p.ImageUrls
                })
                .FirstOrDefaultAsync();

            if (product == null)
            {
                return NotFound(new { message = "Master product not found" });
            }

            return Ok(product);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching master product");
            return StatusCode(500, new { message = "Error fetching product", error = ex.Message });
        }
    }

    /// <summary>
    /// Vendor adds a master product to their inventory
    /// </summary>
    [Authorize(Roles = "Vendor")]
    [HttpPost("add-to-inventory")]
    public async Task<IActionResult> AddToInventory([FromBody] AddProductFromMasterRequest request)
    {
        try
        {
            var vendorId = User.FindFirst("sub")?.Value;
            if (string.IsNullOrEmpty(vendorId))
            {
                return Unauthorized(new { message = "Vendor ID not found" });
            }

            var masterProduct = await _context.MasterProducts.FindAsync(request.MasterProductId);
            if (masterProduct == null)
            {
                return NotFound(new { message = "Master product not found" });
            }

            // Check if vendor already has this product
            var existingProduct = await _context.Products
                .FirstOrDefaultAsync(p => p.VendorId == vendorId && p.MasterProductId == request.MasterProductId);

            if (existingProduct != null)
            {
                return BadRequest(new { message = "Product already in your inventory" });
            }

            // Create product from master
            var product = new Product
            {
                VendorId = vendorId,
                MasterProductId = masterProduct.Id,
                Name = masterProduct.Name,
                Category = masterProduct.Category,
                Description = masterProduct.Description ?? "",
                Unit = masterProduct.Unit,
                CurrentPrice = request.Price,
                AvailableQuantity = request.Stock,
                ImageUrl = masterProduct.ImageUrls.FirstOrDefault(),
                IsActive = true,
                IsLive = request.IsLive
            };

            _context.Products.Add(product);
            await _context.SaveChangesAsync();

            _logger.LogInformation("✅ Vendor {VendorId} added product {ProductName} to inventory", vendorId, masterProduct.Name);

            return Ok(new { 
                message = "Product added to inventory successfully", 
                productId = product.Id,
                product 
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error adding product to inventory");
            return StatusCode(500, new { message = "Error adding product", error = ex.Message });
        }
    }

    /// <summary>
    /// Vendor toggles product live status
    /// </summary>
    [Authorize(Roles = "Vendor")]
    [HttpPatch("{productId}/toggle-live")]
    public async Task<IActionResult> ToggleLiveStatus(int productId)
    {
        try
        {
            var vendorId = User.FindFirst("sub")?.Value;
            if (string.IsNullOrEmpty(vendorId))
            {
                return Unauthorized(new { message = "Vendor ID not found" });
            }

            var product = await _context.Products
                .FirstOrDefaultAsync(p => p.Id == productId && p.VendorId == vendorId);

            if (product == null)
            {
                return NotFound(new { message = "Product not found" });
            }

            product.IsLive = !product.IsLive;
            product.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            _logger.LogInformation("✅ Product {ProductId} live status changed to {IsLive}", productId, product.IsLive);

            return Ok(new { 
                message = $"Product {(product.IsLive ? "published" : "unpublished")} successfully", 
                isLive = product.IsLive 
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error toggling product live status");
            return StatusCode(500, new { message = "Error updating product", error = ex.Message });
        }
    }

    /// <summary>
    /// Get product categories with counts
    /// </summary>
    [HttpGet("categories")]
    public async Task<IActionResult> GetCategories()
    {
        try
        {
            var categories = await _context.MasterProducts
                .GroupBy(p => p.Category)
                .Select(g => new {
                    category = g.Key,
                    count = g.Count(),
                    subCategories = g.Select(p => p.SubCategory).Distinct().ToList()
                })
                .ToListAsync();

            return Ok(new { categories });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching categories");
            return StatusCode(500, new { message = "Error fetching categories", error = ex.Message });
        }
    }
}
