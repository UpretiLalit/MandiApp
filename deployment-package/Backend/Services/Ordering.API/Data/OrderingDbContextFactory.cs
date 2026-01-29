using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace Ordering.API.Data;

public class OrderingDbContextFactory : IDesignTimeDbContextFactory<OrderingDbContext>
{
    public OrderingDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<OrderingDbContext>();
        optionsBuilder.UseNpgsql("Host=localhost;Database=MandiOrderingDB;Username=postgres;Password=postgres");

        return new OrderingDbContext(optionsBuilder.Options);
    }
}
