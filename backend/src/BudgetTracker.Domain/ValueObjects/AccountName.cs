using CSharpFunctionalExtensions;
using Shared.SharedKernel;

namespace BudgetTracker.Domain.ValueObjects;

public class AccountName : ValueObject
{
    public const int MAX_NAME_LENGTH = 50;

    public string Value { get; private set; }

    private AccountName() { }

    private AccountName(string value) => Value = value;

    public static Result<AccountName, Error> Create(string name)
    {
        if (string.IsNullOrWhiteSpace(name))
            return GeneralErrors.ValueIsRequired("название счёта");

        name = name.Trim();

        if (name.Length > MAX_NAME_LENGTH)
            return GeneralErrors.Length("названия счёта", MAX_NAME_LENGTH);

        return new AccountName(name);
    }

    protected override IEnumerable<object> GetEqualityComponents()
    {
        yield return Value;
    }
}
