using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Ordering.API.Services;

namespace Ordering.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[AllowAnonymous]
public class ProductsController : ControllerBase
{
    private readonly IProductService _productService;

    public ProductsController(IProductService productService)
    {
        _productService = productService;
    }

    [HttpGet]
    public async Task<IActionResult> GetProducts()
    {
        var products = await _productService.GetAllProductsAsync();
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

    [HttpGet("category/{category}")]
    public async Task<IActionResult> GetProductsByCategory(string category)
    {
        var products = await _productService.GetProductsByCategoryAsync(category);
        return Ok(products);
    }
}
