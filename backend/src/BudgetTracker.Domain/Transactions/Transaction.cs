using BudgetTracker.Domain.Enums;
using BudgetTracker.Domain.ValueObjects;
using CSharpFunctionalExtensions;
using Shared.SharedKernel;

namespace BudgetTracker.Domain.Transactions;

public class Transaction : Entity<Guid>
{
    public TransactionType Type { get; private set; }

    public Money Amount { get; private set; }

    public DateTime Date { get; private set; }

    public TransactionDescription? Description { get; private set; }

    public Guid AccountId { get; private set; }

    public Guid? ToAccountId { get; private set; }

    public Guid? CategoryId { get; private set; }

    public Guid UserId { get; private set; }

    private Transaction(Guid id) : base(id) { }

    private Transaction(
        Guid id,
        TransactionType type,
        Money amount,
        DateTime date,
        TransactionDescription? description,
        Guid accountId,
        Guid? toAccountId,
        Guid? categoryId,
        Guid userId) : base(id)
    {
        Type = type;
        Amount = amount;
        Date = date;
        Description = description;
        AccountId = accountId;
        ToAccountId = toAccountId;
        CategoryId = categoryId;
        UserId = userId;
    }

    public static Result<Transaction, Error> Create(
        TransactionType type,
        Money amount,
        DateTime date,
        Guid accountId,
        Guid userId,
        Guid? categoryId = null,
        Guid? toAccountId = null,
        TransactionDescription? description = null)
    {
        var invariants = CheckInvariants(type, accountId, categoryId, toAccountId);
        if (invariants.IsFailure)
            return invariants.Error;

        if (userId == Guid.Empty)
            return GeneralErrors.ValueIsInvalid("пользователь");

        return new Transaction(Guid.NewGuid(), type, amount, date, description, accountId, toAccountId, categoryId, userId);
    }

    public UnitResult<Error> Update(
        TransactionType type,
        Money amount,
        DateTime date,
        Guid accountId,
        Guid? categoryId = null,
        Guid? toAccountId = null,
        TransactionDescription? description = null)
    {
        var invariants = CheckInvariants(type, accountId, categoryId, toAccountId);
        if (invariants.IsFailure)
            return invariants.Error;

        Type = type;
        Amount = amount;
        Date = date;
        AccountId = accountId;
        ToAccountId = toAccountId;
        CategoryId = categoryId;
        Description = description;

        return UnitResult.Success<Error>();
    }

    private static UnitResult<Error> CheckInvariants(
        TransactionType type,
        Guid accountId,
        Guid? categoryId,
        Guid? toAccountId)
    {
        if (!Enum.IsDefined(type))
            return GeneralErrors.ValueIsInvalid("тип операции");

        if (accountId == Guid.Empty)
            return GeneralErrors.ValueIsInvalid("счёт");

        if (type == TransactionType.Transfer)
        {
            if (toAccountId is null || toAccountId == Guid.Empty)
                return GeneralErrors.ValueIsRequired("счёт зачисления");

            if (toAccountId == accountId)
                return GeneralErrors.ValueIsInvalid("счёт зачисления (совпадает со счётом списания)");

            if (categoryId is not null)
                return GeneralErrors.ValueIsInvalid("категория (перевод не имеет категории)");
        }
        else
        {
            if (toAccountId is not null)
                return GeneralErrors.ValueIsInvalid("счёт зачисления (только для переводов)");

            if (categoryId is null || categoryId == Guid.Empty)
                return GeneralErrors.ValueIsRequired("категория");
        }

        return UnitResult.Success<Error>();
    }
}
