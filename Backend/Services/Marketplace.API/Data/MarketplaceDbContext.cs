using Microsoft.EntityFrameworkCore;
using Marketplace.API.Models;

namespace Marketplace.API.Data;

public class MarketplaceDbContext : DbContext
{
    public MarketplaceDbContext(DbContextOptions<MarketplaceDbContext> options) : base(options)
    {
    }

    public DbSet<Product> Products { get; set; }
    public DbSet<PriceHistory> PriceHistories { get; set; }
    public DbSet<VendorInventory> VendorInventories { get; set; }
    public DbSet<MasterProduct> MasterProducts { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<MasterProduct>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Category).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Unit).IsRequired().HasMaxLength(50);
            entity.Property(e => e.ImageUrls).HasColumnType("text[]");
            entity.HasIndex(e => e.Category);
            entity.HasIndex(e => e.Name);
        });

        modelBuilder.Entity<Product>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Category).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Grade).HasMaxLength(10);
            entity.Property(e => e.Unit).IsRequired().HasMaxLength(20);
            entity.Property(e => e.CurrentPrice).HasPrecision(18, 2);
            entity.Property(e => e.MinOrderQty).HasDefaultValue(1);
            entity.Property(e => e.Emoji).HasMaxLength(10);
            entity.Property(e => e.PriceTiersJson).HasColumnType("text");
            entity.HasIndex(e => e.VendorId);
            entity.HasIndex(e => e.Category);
            entity.HasIndex(e => e.Grade);
            entity.HasIndex(e => e.IsLive);
            
            entity.HasOne(e => e.MasterProduct)
                .WithMany()
                .HasForeignKey(e => e.MasterProductId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<PriceHistory>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Price).HasPrecision(18, 2);
            entity.HasOne(e => e.Product)
                  .WithMany(p => p.PriceHistory)
                  .HasForeignKey(e => e.ProductId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<VendorInventory>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => new { e.VendorId, e.ProductId }).IsUnique();
            entity.HasOne(e => e.Product)
                  .WithMany()
                  .HasForeignKey(e => e.ProductId)
                  .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
