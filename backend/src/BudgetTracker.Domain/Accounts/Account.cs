using BudgetTracker.Domain.Enums;
using BudgetTracker.Domain.ValueObjects;
using CSharpFunctionalExtensions;
using Shared.SharedKernel;

namespace BudgetTracker.Domain.Accounts;

public class Account : Entity<Guid>
{
    public AccountName Name { get; private set; }

    public AccountType Type { get; private set; }

    public Money InitialBalance { get; private set; }

    public bool IsArchived { get; private set; }

    public Guid OwnerId { get; private set; }

    private Account(Guid id) : base(id) { }

    private Account(
        Guid id,
        AccountName name,
        AccountType type,
        Money initialBalance,
        Guid ownerId) : base(id)
    {
        Name = name;
        Type = type;
        InitialBalance = initialBalance;
        OwnerId = ownerId;
    }

    public static Result<Account, Error> Create(
        AccountName name,
        AccountType type,
        Money initialBalance,
        Guid ownerId)
    {
        if (!Enum.IsDefined(type))
            return GeneralErrors.ValueIsInvalid("тип счёта");

        if (ownerId == Guid.Empty)
            return GeneralErrors.ValueIsInvalid("владелец счёта");

        return new Account(Guid.NewGuid(), name, type, initialBalance, ownerId);
    }

    public void Rename(AccountName name)
    {
        Name = name;
    }

    public void Archive()
    {
        IsArchived = true;
    }
}
