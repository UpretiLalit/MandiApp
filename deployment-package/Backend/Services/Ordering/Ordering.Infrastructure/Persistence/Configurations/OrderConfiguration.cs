using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Ordering.Domain.Aggregates.OrderAggregate;

namespace Ordering.Infrastructure.Persistence.Configurations;

public class OrderConfiguration : IEntityTypeConfiguration<Order>
{
    public void Configure(EntityTypeBuilder<Order> builder)
    {
        builder.ToTable("Orders");

        builder.HasKey(o => o.Id);

        builder.Property(o => o.OrderNumber)
            .IsRequired()
            .HasMaxLength(50);

        builder.HasIndex(o => o.OrderNumber).IsUnique();
        builder.HasIndex(o => o.BuyerId);
        builder.HasIndex(o => o.Status);

        // Configure BuyerPhone value object
        builder.OwnsOne(o => o.BuyerPhone, phone =>
        {
            phone.Property(p => p.Number)
                .HasColumnName("BuyerPhone")
                .IsRequired()
                .HasMaxLength(10);
        });

        // Configure DeliveryAddress value object
        builder.OwnsOne(o => o.DeliveryAddress, address =>
        {
            address.Property(a => a.Street)
                .HasColumnName("Street")
                .IsRequired()
                .HasMaxLength(200);

            address.Property(a => a.City)
                .HasColumnName("City")
                .IsRequired()
                .HasMaxLength(100);

            address.Property(a => a.State)
                .HasColumnName("State")
                .IsRequired()
                .HasMaxLength(100);

            address.Property(a => a.Pincode)
                .HasColumnName("Pincode")
                .IsRequired()
                .HasMaxLength(6);

            address.Property(a => a.Latitude)
                .HasColumnName("Latitude");

            address.Property(a => a.Longitude)
                .HasColumnName("Longitude");
        });

        // Configure Money value objects
        builder.OwnsOne(o => o.TotalAmount, money =>
        {
            money.Property(m => m.Amount)
                .HasColumnName("TotalAmount")
                .HasPrecision(18, 2);

            money.Property(m => m.Currency)
                .HasColumnName("Currency")
                .HasMaxLength(3)
                .HasDefaultValue("INR");
        });

        builder.OwnsOne(o => o.LogisticsFee, money =>
        {
            money.Property(m => m.Amount)
                .HasColumnName("LogisticsFee")
                .HasPrecision(18, 2);

            money.Property(m => m.Currency)
                .HasColumnName("LogisticsFee_Currency")
                .HasMaxLength(3)
                .HasDefaultValue("INR");
        });

        builder.OwnsOne(o => o.ServiceFee, money =>
        {
            money.Property(m => m.Amount)
                .HasColumnName("ServiceFee")
                .HasPrecision(18, 2);

            money.Property(m => m.Currency)
                .HasColumnName("ServiceFee_Currency")
                .HasMaxLength(3)
                .HasDefaultValue("INR");
        });

        builder.OwnsOne(o => o.GrandTotal, money =>
        {
            money.Property(m => m.Amount)
                .HasColumnName("GrandTotal")
                .HasPrecision(18, 2);

            money.Property(m => m.Currency)
                .HasColumnName("GrandTotal_Currency")
                .HasMaxLength(3)
                .HasDefaultValue("INR");
        });

        // Configure Items collection
        builder.HasMany(o => o.Items)
            .WithOne()
            .HasForeignKey("OrderId")
            .OnDelete(DeleteBehavior.Cascade);

        // Ignore domain events collection (not persisted)
        builder.Ignore(o => o.DomainEvents);
    }
}
