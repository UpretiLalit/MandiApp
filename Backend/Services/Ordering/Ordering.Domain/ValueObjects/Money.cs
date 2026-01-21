using Ordering.Domain.Common;

namespace Ordering.Domain.ValueObjects;

/// <summary>
/// Value object representing money with amount and currency.
/// Immutable and supports arithmetic operations.
/// </summary>
public class Money : ValueObject
{
    public decimal Amount { get; }
    public string Currency { get; }

    private Money() { } // For EF Core

    private Money(decimal amount, string currency)
    {
        if (amount < 0)
            throw new ArgumentException("Amount cannot be negative", nameof(amount));

        if (string.IsNullOrWhiteSpace(currency))
            throw new ArgumentException("Currency is required", nameof(currency));

        Amount = amount;
        Currency = currency.ToUpperInvariant();
    }

    public static Money Create(decimal amount, string currency = "INR")
    {
        return new Money(amount, currency);
    }

    public static Money Zero(string currency = "INR")
    {
        return new Money(0, currency);
    }

    public Money Add(Money other)
    {
        if (Currency != other.Currency)
            throw new InvalidOperationException($"Cannot add money with different currencies: {Currency} and {other.Currency}");

        return new Money(Amount + other.Amount, Currency);
    }

    public Money Subtract(Money other)
    {
        if (Currency != other.Currency)
            throw new InvalidOperationException($"Cannot subtract money with different currencies: {Currency} and {other.Currency}");

        return new Money(Amount - other.Amount, Currency);
    }

    public Money Multiply(decimal multiplier)
    {
        return new Money(Amount * multiplier, Currency);
    }

    public Money Divide(decimal divisor)
    {
        if (divisor == 0)
            throw new DivideByZeroException("Cannot divide money by zero");

        return new Money(Amount / divisor, Currency);
    }

    public static Money operator +(Money left, Money right)
    {
        return left.Add(right);
    }

    public static Money operator -(Money left, Money right)
    {
        return left.Subtract(right);
    }

    public static Money operator *(Money money, decimal multiplier)
    {
        return money.Multiply(multiplier);
    }

    public static Money operator /(Money money, decimal divisor)
    {
        return money.Divide(divisor);
    }

    protected override IEnumerable<object> GetEqualityComponents()
    {
        yield return Amount;
        yield return Currency;
    }

    public override string ToString()
    {
        return $"{Amount:N2} {Currency}";
    }
}
