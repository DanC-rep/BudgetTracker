using BudgetTracker.Domain.Transactions;

namespace BudgetTracker.Application.Transactions;

public sealed record TransactionInfo(
    Guid Id,
    string Type,
    decimal Amount,
    string Currency,
    DateTime Date,
    string? Description,
    Guid AccountId,
    Guid? ToAccountId,
    Guid? CategoryId)
{
    public static TransactionInfo From(Transaction transaction) =>
        new(
            transaction.Id,
            transaction.Type.ToString(),
            transaction.Amount.Amount,
            transaction.Amount.Currency,
            transaction.Date,
            transaction.Description?.Value,
            transaction.AccountId,
            transaction.ToAccountId,
            transaction.CategoryId);
}
