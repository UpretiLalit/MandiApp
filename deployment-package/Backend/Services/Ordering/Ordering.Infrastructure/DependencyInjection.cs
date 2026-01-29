using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Ordering.Domain.DomainServices;
using Ordering.Domain.Repositories;
using Ordering.Infrastructure.Persistence.Repositories;

namespace Ordering.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        // Register repositories (will use existing OrderingDbContext from API)
        services.AddScoped<IOrderRepository, OrderRepository>();

        // Register domain services
        services.AddScoped<OrderPricingService>();

        return services;
    }
}
