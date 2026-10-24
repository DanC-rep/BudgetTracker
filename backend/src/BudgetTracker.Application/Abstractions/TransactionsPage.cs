using BudgetTracker.Domain.Transactions;

namespace BudgetTracker.Application.Abstractions;

public sealed record TransactionsPage(IReadOnlyList<Transaction> Items, int TotalCount);
