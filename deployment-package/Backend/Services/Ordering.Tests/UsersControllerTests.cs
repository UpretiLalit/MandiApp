using System.Net;
using System.Net.Http.Json;
using Xunit;

namespace Ordering.Tests;

public class UsersControllerTests : IClassFixture<CustomWebApplicationFactory<Program>>
{
    private readonly HttpClient _client;

    public UsersControllerTests(CustomWebApplicationFactory<Program> factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GetAllUsers_ReturnsSuccess()
    {
        // Act
        var response = await _client.GetAsync("/api/users");

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var users = await response.Content.ReadFromJsonAsync<object[]>();
        Assert.NotNull(users);
    }

    [Fact]
    public async Task GetUser_WithInvalidId_ReturnsNotFound()
    {
        // Act
        var response = await _client.GetAsync("/api/users/invalid-id");

        // Assert
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task GetAllUsers_WithRoleFilter_ReturnsSuccess()
    {
        // Act
        var response = await _client.GetAsync("/api/users?role=Vendor");

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }
}
