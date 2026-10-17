using BudgetTracker.Domain.ValueObjects;
using CSharpFunctionalExtensions;
using Shared.SharedKernel;

namespace BudgetTracker.Domain.Budgets;

public class Budget : Entity<Guid>
{
    public Money Limit { get; private set; }

    public BudgetPeriod Period { get; private set; }

    public Guid? CategoryId { get; private set; }

    public Guid UserId { get; private set; }

    private Budget(Guid id) : base(id) { }

    private Budget(
        Guid id,
        Money limit,
        BudgetPeriod period,
        Guid? categoryId,
        Guid userId) : base(id)
    {
        Limit = limit;
        Period = period;
        CategoryId = categoryId;
        UserId = userId;
    }

    public static Result<Budget, Error> Create(
        Money limit,
        BudgetPeriod period,
        Guid userId,
        Guid? categoryId = null)
    {
        if (userId == Guid.Empty)
            return GeneralErrors.ValueIsInvalid("пользователь");

        return new Budget(Guid.NewGuid(), limit, period, categoryId, userId);
    }

    public void ChangeLimit(Money limit)
    {
        Limit = limit;
    }
}
