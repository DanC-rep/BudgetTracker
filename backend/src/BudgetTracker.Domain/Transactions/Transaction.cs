using BudgetTracker.Domain.ValueObjects;
using CSharpFunctionalExtensions;
using Shared.SharedKernel;

namespace BudgetTracker.Domain.Transactions;

public class Transaction : Entity<Guid>
{
    public Money Amount { get; private set; }

    public DateOnly Date { get; private set; }

    public TransactionDescription? Description { get; private set; }

    public Guid CategoryId { get; private set; }

    public Guid UserId { get; private set; }

    private Transaction(Guid id) : base(id) { }

    private Transaction(
        Guid id,
        Money amount,
        DateOnly date,
        TransactionDescription? description,
        Guid categoryId,
        Guid userId) : base(id)
    {
        Amount = amount;
        Date = date;
        Description = description;
        CategoryId = categoryId;
        UserId = userId;
    }

    public static Result<Transaction, Error> Create(
        Money amount,
        DateOnly date,
        Guid categoryId,
        Guid userId,
        TransactionDescription? description = null)
    {
        if (categoryId == Guid.Empty)
            return GeneralErrors.ValueIsInvalid("категория");

        if (userId == Guid.Empty)
            return GeneralErrors.ValueIsInvalid("пользователь");

        return new Transaction(Guid.NewGuid(), amount, date, description, categoryId, userId);
    }

    public void Update(Money amount, DateOnly date, TransactionDescription? description)
    {
        Amount = amount;
        Date = date;
        Description = description;
    }
}
