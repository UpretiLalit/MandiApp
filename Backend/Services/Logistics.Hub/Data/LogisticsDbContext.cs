using Microsoft.EntityFrameworkCore;
using Logistics.Hub.Models;

namespace Logistics.Hub.Data;

public class LogisticsDbContext : DbContext
{
    public LogisticsDbContext(DbContextOptions<LogisticsDbContext> options) : base(options)
    {
    }

    public DbSet<Delivery> Deliveries { get; set; }
    public DbSet<LocationTracking> LocationTrackings { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Delivery>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.OrderId).IsUnique();
            entity.HasIndex(e => e.TransporterId);
            entity.HasIndex(e => e.Status);
        });

        modelBuilder.Entity<LocationTracking>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => new { e.DeliveryId, e.Timestamp });
            entity.HasOne(e => e.Delivery)
                  .WithMany(d => d.LocationTrackings)
                  .HasForeignKey(e => e.DeliveryId)
                  .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
