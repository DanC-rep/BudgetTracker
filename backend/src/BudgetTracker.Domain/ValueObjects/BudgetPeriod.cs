using CSharpFunctionalExtensions;
using Shared.SharedKernel;

namespace BudgetTracker.Domain.ValueObjects;

public class BudgetPeriod : ValueObject
{
    public int Year { get; private set; }

    public int Month { get; private set; }

    private BudgetPeriod() { }

    private BudgetPeriod(int year, int month)
    {
        Year = year;
        Month = month;
    }

    public static Result<BudgetPeriod, Error> Create(int year, int month)
    {
        if (year < 2000 || year > 2100)
            return GeneralErrors.ValueIsInvalid("год");

        if (month < 1 || month > 12)
            return GeneralErrors.ValueIsInvalid("месяц");

        return new BudgetPeriod(year, month);
    }

    public static BudgetPeriod Current()
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        return new BudgetPeriod(today.Year, today.Month);
    }

    protected override IEnumerable<object> GetEqualityComponents()
    {
        yield return Year;
        yield return Month;
    }
}
