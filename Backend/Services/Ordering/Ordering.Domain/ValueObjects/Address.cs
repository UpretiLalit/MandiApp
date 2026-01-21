using Ordering.Domain.Common;
using System.Text.RegularExpressions;

namespace Ordering.Domain.ValueObjects;

/// <summary>
/// Value object representing a delivery address.
/// Immutable with validation for Indian addresses.
/// </summary>
public class Address : ValueObject
{
    public string Street { get; }
    public string City { get; }
    public string State { get; }
    public string Pincode { get; }
    public double? Latitude { get; }
    public double? Longitude { get; }

    private Address() { } // For EF Core

    private Address(string street, string city, string state, string pincode, double? latitude = null, double? longitude = null)
    {
        if (string.IsNullOrWhiteSpace(street))
            throw new ArgumentException("Street is required", nameof(street));

        if (string.IsNullOrWhiteSpace(city))
            throw new ArgumentException("City is required", nameof(city));

        if (string.IsNullOrWhiteSpace(state))
            throw new ArgumentException("State is required", nameof(state));

        if (string.IsNullOrWhiteSpace(pincode))
            throw new ArgumentException("Pincode is required", nameof(pincode));

        if (!IsValidPincode(pincode))
            throw new ArgumentException("Pincode must be 6 digits", nameof(pincode));

        Street = street;
        City = city;
        State = state;
        Pincode = pincode;
        Latitude = latitude;
        Longitude = longitude;
    }

    public static Address Create(string street, string city, string state, string pincode, 
        double? latitude = null, double? longitude = null)
    {
        return new Address(street, city, state, pincode, latitude, longitude);
    }

    private static bool IsValidPincode(string pincode)
    {
        return Regex.IsMatch(pincode, @"^\d{6}$");
    }

    public string GetFullAddress()
    {
        return $"{Street}, {City}, {State} - {Pincode}";
    }

    public bool HasCoordinates()
    {
        return Latitude.HasValue && Longitude.HasValue;
    }

    protected override IEnumerable<object> GetEqualityComponents()
    {
        yield return Street;
        yield return City;
        yield return State;
        yield return Pincode;
    }

    public override string ToString()
    {
        return GetFullAddress();
    }
}
