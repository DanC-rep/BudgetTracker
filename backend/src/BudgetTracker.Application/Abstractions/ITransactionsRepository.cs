using BudgetTracker.Domain.Enums;
using BudgetTracker.Domain.Transactions;

namespace BudgetTracker.Application.Abstractions;

public interface ITransactionsRepository
{
    Task<Transaction?> GetByIdAsync(Guid userId, Guid transactionId, CancellationToken cancellationToken);

    Task AddAsync(Transaction transaction, CancellationToken cancellationToken);

    void Update(Transaction transaction);

    void Delete(Transaction transaction);

    Task<TransactionsPage> GetAsync(
        Guid userId,
        DateTime? from,
        DateTime? to,
        Guid? accountId,
        Guid? categoryId,
        TransactionType? type,
        int page,
        int pageSize,
        CancellationToken cancellationToken);

    Task<IReadOnlyList<CategoryTotal>> GetCategoryTotalsAsync(
        Guid userId,
        DateTime from,
        DateTime toExclusive,
        CancellationToken cancellationToken);

    Task<IReadOnlyList<Transaction>> GetLatestAsync(Guid userId, int limit, CancellationToken cancellationToken);

    Task<IReadOnlyList<Transaction>> GetLatestForAccountAsync(
        Guid userId,
        Guid accountId,
        int limit,
        CancellationToken cancellationToken);

    Task<bool> AnyForAccountAsync(Guid userId, Guid accountId, CancellationToken cancellationToken);

    Task<bool> AnyForCategoryAsync(Guid userId, Guid categoryId, CancellationToken cancellationToken);
}
