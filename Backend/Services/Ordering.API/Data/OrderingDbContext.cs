using Microsoft.EntityFrameworkCore;
using Ordering.API.Models;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Identity.API.Models;

namespace Ordering.API.Data;

public class OrderingDbContext : IdentityDbContext<ApplicationUser>
{
    public OrderingDbContext(DbContextOptions<OrderingDbContext> options) : base(options)
    {
    }

    public DbSet<Order> Orders { get; set; }
    public DbSet<OrderItem> OrderItems { get; set; }
    public DbSet<Cart> Carts { get; set; }
    public DbSet<CartItem> CartItems { get; set; }
    public DbSet<Payment> Payments { get; set; }
    public DbSet<Buyer> Buyers { get; set; }
    public DbSet<Vendor> Vendors { get; set; }
    public DbSet<Transporter> Transporters { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Order>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.OrderNumber).IsRequired().HasMaxLength(50);
            entity.Property(e => e.TotalAmount).HasPrecision(18, 2);
            entity.HasIndex(e => e.BuyerId);
            entity.HasIndex(e => e.OrderNumber).IsUnique();
        });

        modelBuilder.Entity<OrderItem>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.UnitPrice).HasPrecision(18, 2);
            entity.Property(e => e.TotalPrice).HasPrecision(18, 2);
            entity.HasOne(e => e.Order)
                  .WithMany(o => o.OrderItems)
                  .HasForeignKey(e => e.OrderId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Cart>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.BuyerId).IsUnique();
        });

        modelBuilder.Entity<CartItem>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.UnitPrice).HasPrecision(18, 2);
            entity.Property(e => e.Unit).IsRequired(false);
            entity.Property(e => e.AddedAt).HasDefaultValueSql("NOW()");
            // VendorId is stored as a plain string reference — no FK to Vendors table
            entity.Property(e => e.VendorId).IsRequired(false);
            entity.HasOne(e => e.Cart)
                  .WithMany(c => c.CartItems)
                  .HasForeignKey(e => e.CartId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Payment>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Amount).HasPrecision(18, 2);
            entity.HasOne(e => e.Order)
                  .WithOne(o => o.Payment)
                  .HasForeignKey<Payment>(p => p.OrderId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Buyer>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.CreditLimit).HasPrecision(18, 2);
            entity.Property(e => e.OutstandingBalance).HasPrecision(18, 2);
            entity.HasIndex(e => e.PhoneNumber);
        });

        modelBuilder.Entity<Vendor>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.CommissionRate).HasPrecision(5, 4);
            entity.Property(e => e.TotalEarnings).HasPrecision(18, 2);
            entity.Property(e => e.Rating).HasPrecision(3, 2);
            entity.HasIndex(e => e.PhoneNumber);
            entity.HasIndex(e => e.IsActive);
        });

        modelBuilder.Entity<Transporter>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.TotalEarnings).HasPrecision(18, 2);
            entity.Property(e => e.Rating).HasPrecision(3, 2);
            entity.HasIndex(e => e.PhoneNumber);
            entity.HasIndex(e => e.IsAvailable);
        });
    }
}
