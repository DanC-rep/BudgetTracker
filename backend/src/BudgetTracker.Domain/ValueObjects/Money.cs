using CSharpFunctionalExtensions;
using Shared.SharedKernel;

namespace BudgetTracker.Domain.ValueObjects;

public class Money : ValueObject
{
    public const int MAX_PRECISION = 2;

    public decimal Amount { get; private set; }

    public string Currency { get; private set; }

    private Money() { }

    private Money(decimal amount, string currency)
    {
        Amount = amount;
        Currency = currency;
    }

    public static Result<Money, Error> Create(decimal amount, string currency)
    {
        if (amount <= 0)
            return Error.Validation("money.amount.must.be.positive", "Сумма должна быть больше нуля");

        return CreateInternal(amount, currency);
    }

    public static Result<Money, Error> CreateNonNegative(decimal amount, string currency)
    {
        if (amount < 0)
            return Error.Validation("money.amount.must.not.be.negative", "Сумма не может быть отрицательной");

        return CreateInternal(amount, currency);
    }

    private static Result<Money, Error> CreateInternal(decimal amount, string currency)
    {
        if (decimal.Round(amount, MAX_PRECISION) != amount)
            return Error.Validation("money.precision.invalid", "Сумма не может иметь более двух знаков после запятой");

        if (string.IsNullOrWhiteSpace(currency) || currency.Length != 3)
            return GeneralErrors.ValueIsInvalid("валюта");

        return new Money(amount, currency.Trim().ToUpperInvariant());
    }

    protected override IEnumerable<object> GetEqualityComponents()
    {
        yield return Amount;
        yield return Currency;
    }
}
