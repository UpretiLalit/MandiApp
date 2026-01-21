using Ordering.Domain.Common;
using System.Text.RegularExpressions;

namespace Ordering.Domain.ValueObjects;

/// <summary>
/// Value object representing a phone number.
/// Immutable with validation for Indian phone numbers.
/// </summary>
public class PhoneNumber : ValueObject
{
    public string Number { get; }

    private PhoneNumber() { } // For EF Core

    private PhoneNumber(string number)
    {
        if (string.IsNullOrWhiteSpace(number))
            throw new ArgumentException("Phone number is required", nameof(number));

        var cleanedNumber = CleanPhoneNumber(number);

        if (!IsValidIndianPhoneNumber(cleanedNumber))
            throw new ArgumentException("Invalid Indian phone number format. Must be 10 digits starting with 6-9.", nameof(number));

        Number = cleanedNumber;
    }

    public static PhoneNumber Create(string number)
    {
        return new PhoneNumber(number);
    }

    private static string CleanPhoneNumber(string number)
    {
        // Remove spaces, dashes, and +91 prefix
        var cleaned = Regex.Replace(number, @"[\s\-\(\)]", "");

        if (cleaned.StartsWith("+91"))
            cleaned = cleaned.Substring(3);
        else if (cleaned.StartsWith("91") && cleaned.Length == 12)
            cleaned = cleaned.Substring(2);

        return cleaned;
    }

    private static bool IsValidIndianPhoneNumber(string number)
    {
        // Must be 10 digits starting with 6, 7, 8, or 9
        return Regex.IsMatch(number, @"^[6-9]\d{9}$");
    }

    public string GetFormattedNumber()
    {
        if (Number.Length == 10)
            return $"+91 {Number.Substring(0, 5)} {Number.Substring(5)}";

        return Number;
    }

    protected override IEnumerable<object> GetEqualityComponents()
    {
        yield return Number;
    }

    public override string ToString()
    {
        return GetFormattedNumber();
    }
}
