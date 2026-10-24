namespace BudgetTracker.Application.Accounts;

public sealed record AccountInfo(
    Guid Id,
    string Name,
    string Type,
    decimal InitialBalance,
    string Currency,
    decimal Balance,
    bool IsArchived);
