using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Ordering.Domain.Aggregates.OrderAggregate;

namespace Ordering.Infrastructure.Persistence.Configurations;

public class OrderItemConfiguration : IEntityTypeConfiguration<OrderItem>
{
    public void Configure(EntityTypeBuilder<OrderItem> builder)
    {
        builder.ToTable("OrderItems");

        builder.HasKey(o => o.Id);

        builder.Property(o => o.ProductName)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(o => o.Quantity)
            .IsRequired();

        // Configure UnitPrice value object
        builder.OwnsOne(o => o.UnitPrice, money =>
        {
            money.Property(m => m.Amount)
                .HasColumnName("UnitPrice")
                .HasPrecision(18, 2);

            money.Property(m => m.Currency)
                .HasColumnName("Currency")
                .HasMaxLength(3)
                .HasDefaultValue("INR");
        });

        // Configure TotalPrice value object
        builder.OwnsOne(o => o.TotalPrice, money =>
        {
            money.Property(m => m.Amount)
                .HasColumnName("TotalPrice")
                .HasPrecision(18, 2);

            money.Property(m => m.Currency)
                .HasColumnName("TotalPrice_Currency")
                .HasMaxLength(3)
                .HasDefaultValue("INR");
        });

        // Ignore domain events
        builder.Ignore(o => o.DomainEvents);
    }
}
