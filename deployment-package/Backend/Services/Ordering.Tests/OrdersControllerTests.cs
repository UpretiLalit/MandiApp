using System.Net;
using System.Net.Http.Json;
using Xunit;

namespace Ordering.Tests;

public class OrdersControllerTests : IClassFixture<CustomWebApplicationFactory<Program>>
{
    private readonly HttpClient _client;

    public OrdersControllerTests(CustomWebApplicationFactory<Program> factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GetTransporterJobs_ReturnsSuccess()
    {
        // Act
        var response = await _client.GetAsync("/api/orders/transporter-jobs");

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var jobs = await response.Content.ReadFromJsonAsync<object[]>();
        Assert.NotNull(jobs);
    }

    [Fact]
    public async Task GetOrder_WithInvalidId_ReturnsNotFound()
    {
        // Act
        var response = await _client.GetAsync("/api/orders/99999");

        // Assert
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }
}
