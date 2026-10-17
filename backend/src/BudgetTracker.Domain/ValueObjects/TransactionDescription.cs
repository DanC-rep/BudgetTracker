using CSharpFunctionalExtensions;
using Shared.SharedKernel;

namespace BudgetTracker.Domain.ValueObjects;

public class TransactionDescription : ValueObject
{
    public const int MAX_DESCRIPTION_LENGTH = 500;

    public string Value { get; private set; }

    private TransactionDescription() { }

    private TransactionDescription(string value) => Value = value;

    public static Result<TransactionDescription, Error> Create(string description)
    {
        if (string.IsNullOrWhiteSpace(description))
            return GeneralErrors.ValueIsRequired("описание");

        description = description.Trim();

        if (description.Length > MAX_DESCRIPTION_LENGTH)
            return GeneralErrors.Length("описания", MAX_DESCRIPTION_LENGTH);

        return new TransactionDescription(description);
    }

    protected override IEnumerable<object> GetEqualityComponents()
    {
        yield return Value;
    }
}
