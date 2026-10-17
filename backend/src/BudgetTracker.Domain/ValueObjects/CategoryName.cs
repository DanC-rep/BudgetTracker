using CSharpFunctionalExtensions;
using Shared.SharedKernel;

namespace BudgetTracker.Domain.ValueObjects;

public class CategoryName : ValueObject
{
    public const int MAX_NAME_LENGTH = 50;

    public string Value { get; private set; }

    private CategoryName() { }

    private CategoryName(string value) => Value = value;

    public static Result<CategoryName, Error> Create(string name)
    {
        if (string.IsNullOrWhiteSpace(name))
            return GeneralErrors.ValueIsRequired("название категории");

        name = name.Trim();

        if (name.Length > MAX_NAME_LENGTH)
            return GeneralErrors.Length("названия категории", MAX_NAME_LENGTH);

        return new CategoryName(name);
    }

    protected override IEnumerable<object> GetEqualityComponents()
    {
        yield return Value;
    }
}
