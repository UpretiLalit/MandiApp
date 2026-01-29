using Ordering.Domain.Aggregates.OrderAggregate;
using Ordering.Domain.ValueObjects;

namespace Ordering.Domain.DomainServices;

/// <summary>
/// Domain service for calculating order pricing.
/// Contains complex business logic for pricing that doesn't belong to a single entity.
/// </summary>
public class OrderPricingService
{
    private const decimal SERVICE_FEE_PERCENTAGE = 0.05m; // 5% service fee
    private const decimal GST_PERCENTAGE = 0.18m; // 18% GST
    private const decimal BASE_LOGISTICS_FEE = 50m; // Base fee in INR
    private const decimal PER_KM_RATE = 10m; // Per km rate in INR
    private const decimal WEIGHT_MULTIPLIER = 1.5m; // Additional cost per kg

    /// <summary>
    /// Calculate total pricing including logistics and service fees
    /// </summary>
    public (Money logisticsFee, Money serviceFee) CalculateFees(Order order, double distanceInKm, double weightInKg = 10)
    {
        var logisticsFee = CalculateLogisticsFee(distanceInKm, weightInKg);
        var serviceFee = CalculateServiceFee(order.TotalAmount);

        return (logisticsFee, serviceFee);
    }

    /// <summary>
    /// Calculate logistics fee based on distance and weight
    /// Formula: Base Fee + (Distance * Per KM Rate) + (Weight * Weight Multiplier)
    /// </summary>
    private Money CalculateLogisticsFee(double distanceInKm, double weightInKg)
    {
        if (distanceInKm < 0)
            throw new ArgumentException("Distance cannot be negative", nameof(distanceInKm));

        if (weightInKg < 0)
            throw new ArgumentException("Weight cannot be negative", nameof(weightInKg));

        var distanceCost = (decimal)distanceInKm * PER_KM_RATE;
        var weightCost = (decimal)weightInKg * WEIGHT_MULTIPLIER;
        var totalFee = BASE_LOGISTICS_FEE + distanceCost + weightCost;

        return Money.Create(Math.Round(totalFee, 2));
    }

    /// <summary>
    /// Calculate service fee (platform commission)
    /// Formula: Order Total * Service Fee Percentage
    /// </summary>
    private Money CalculateServiceFee(Money orderTotal)
    {
        var fee = orderTotal.Amount * SERVICE_FEE_PERCENTAGE;
        return Money.Create(Math.Round(fee, 2));
    }

    /// <summary>
    /// Calculate GST on taxable amount
    /// </summary>
    public Money CalculateGST(Money taxableAmount)
    {
        var gst = taxableAmount.Amount * GST_PERCENTAGE;
        return Money.Create(Math.Round(gst, 2));
    }

    /// <summary>
    /// Get distance between two coordinates (Haversine formula)
    /// </summary>
    public double CalculateDistance(double lat1, double lon1, double lat2, double lon2)
    {
        const double EarthRadiusKm = 6371.0;

        var dLat = DegreesToRadians(lat2 - lat1);
        var dLon = DegreesToRadians(lon2 - lon1);

        var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                Math.Cos(DegreesToRadians(lat1)) * Math.Cos(DegreesToRadians(lat2)) *
                Math.Sin(dLon / 2) * Math.Sin(dLon / 2);

        var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));

        return EarthRadiusKm * c;
    }

    private double DegreesToRadians(double degrees)
    {
        return degrees * Math.PI / 180.0;
    }
}
