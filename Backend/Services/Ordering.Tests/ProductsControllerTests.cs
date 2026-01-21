using System.Net;
using System.Net.Http.Json;
using Xunit;

namespace Ordering.Tests;

public class ProductsControllerTests : IClassFixture<CustomWebApplicationFactory<Program>>
{
    private readonly HttpClient _client;

    public ProductsControllerTests(CustomWebApplicationFactory<Program> factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GetProducts_ReturnsSuccess()
    {
        // Act
        var response = await _client.GetAsync("/api/products");

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var products = await response.Content.ReadFromJsonAsync<object[]>();
        Assert.NotNull(products);
        Assert.NotEmpty(products);
    }

    [Fact]
    public async Task GetProduct_WithValidId_ReturnsProduct()
    {
        // Act
        var response = await _client.GetAsync("/api/products/1");

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task GetProduct_WithInvalidId_ReturnsNotFound()
    {
        // Act
        var response = await _client.GetAsync("/api/products/999");

        // Assert
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task GetProductsByCategory_ReturnsFilteredProducts()
    {
        // Act
        var response = await _client.GetAsync("/api/products/category/Vegetables");

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var products = await response.Content.ReadFromJsonAsync<object[]>();
        Assert.NotNull(products);
    }
}
