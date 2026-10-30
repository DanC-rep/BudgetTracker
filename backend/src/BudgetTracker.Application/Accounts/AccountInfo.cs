using BudgetTracker.Domain.Enums;

namespace BudgetTracker.Application.Accounts;

public sealed record AccountInfo(
    Guid Id,
    string Name,
    AccountType Type,
    decimal InitialBalance,
    string Currency,
    decimal Balance,
    bool IsArchived);
