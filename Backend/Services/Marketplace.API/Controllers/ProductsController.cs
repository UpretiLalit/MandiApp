using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Marketplace.API.Services;
using Marketplace.API.DTOs;

namespace Marketplace.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[AllowAnonymous] // Temporarily allow anonymous for testing
public class ProductsController : ControllerBase
{
    private readonly IProductService _productService;
    private readonly IPriceService _priceService;

    public ProductsController(IProductService productService, IPriceService priceService)
    {
        _productService = productService;
        _priceService = priceService;
    }

    [HttpGet]
    public async Task<IActionResult> GetProducts([FromQuery] string? category = null)
    {
        var products = await _productService.GetAllProductsAsync(category);
        return Ok(products);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetProduct(int id)
    {
        var product = await _productService.GetProductByIdAsync(id);
        if (product == null)
            return NotFound();

        return Ok(product);
    }

    [Authorize(Roles = "Vendor")]
    [HttpGet("my-products")]
    public async Task<IActionResult> GetMyProducts()
    {
        var vendorId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (vendorId == null)
            return Unauthorized();

        var products = await _productService.GetVendorProductsAsync(vendorId);
        return Ok(products);
    }

    [Authorize(Roles = "Vendor")]
    [HttpPost]
    public async Task<IActionResult> CreateProduct([FromBody] CreateProductRequest request)
    {
        var vendorId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (vendorId == null)
            return Unauthorized();

        var product = await _productService.CreateProductAsync(request, vendorId);
        return CreatedAtAction(nameof(GetProduct), new { id = product.Id }, product);
    }

    [Authorize(Roles = "Vendor")]
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateProduct(int id, [FromBody] UpdateProductRequest request)
    {
        var vendorId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (vendorId == null)
            return Unauthorized();

        var product = await _productService.UpdateProductAsync(id, request, vendorId);
        if (product == null)
            return NotFound();

        return Ok(product);
    }

    [Authorize(Roles = "Vendor")]
    [HttpPost("quick-price-update")]
    public async Task<IActionResult> QuickPriceUpdate([FromBody] QuickPriceUpdateRequest request)
    {
        var vendorId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (vendorId == null)
            return Unauthorized();

        var success = await _priceService.UpdatePriceAsync(request.ProductId, request.NewPrice, vendorId);
        if (!success)
            return NotFound();

        return Ok(new { message = "Price updated successfully" });
    }

    [HttpGet("{id}/price-history")]
    public async Task<IActionResult> GetPriceHistory(int id)
    {
        var history = await _priceService.GetPriceHistoryAsync(id);
        return Ok(history);
    }

    [Authorize(Roles = "Vendor")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteProduct(int id)
    {
        var vendorId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (vendorId == null)
            return Unauthorized();

        var success = await _productService.DeleteProductAsync(id, vendorId);
        if (!success)
            return NotFound();

        return Ok(new { message = "Product deleted successfully" });
    }
}
