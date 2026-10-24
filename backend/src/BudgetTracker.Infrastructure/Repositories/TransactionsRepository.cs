using BudgetTracker.Application.Abstractions;
using BudgetTracker.Domain.Enums;
using BudgetTracker.Domain.Transactions;
using BudgetTracker.Infrastructure.DbContexts;
using Microsoft.EntityFrameworkCore;

namespace BudgetTracker.Infrastructure.Repositories;

public class TransactionsRepository : ITransactionsRepository
{
    private readonly BudgetTrackerDbContext _dbContext;

    public TransactionsRepository(BudgetTrackerDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public Task<Transaction?> GetByIdAsync(Guid userId, Guid transactionId, CancellationToken cancellationToken) =>
        _dbContext.Transactions.FirstOrDefaultAsync(
            t => t.Id == transactionId && t.UserId == userId,
            cancellationToken);

    public async Task AddAsync(Transaction transaction, CancellationToken cancellationToken) =>
        await _dbContext.Transactions.AddAsync(transaction, cancellationToken);

    public void Update(Transaction transaction) =>
        _dbContext.Transactions.Update(transaction);

    public void Delete(Transaction transaction) =>
        _dbContext.Transactions.Remove(transaction);

    public async Task<TransactionsPage> GetAsync(
        Guid userId,
        DateTime? from,
        DateTime? to,
        Guid? accountId,
        Guid? categoryId,
        TransactionType? type,
        int page,
        int pageSize,
        CancellationToken cancellationToken)
    {
        var query = _dbContext.Transactions.Where(t => t.UserId == userId);

        if (from.HasValue)
            query = query.Where(t => t.Date >= from.Value);

        if (to.HasValue)
            query = query.Where(t => t.Date <= to.Value);

        if (accountId.HasValue)
            query = query.Where(t => t.AccountId == accountId.Value || t.ToAccountId == accountId.Value);

        if (categoryId.HasValue)
            query = query.Where(t => t.CategoryId == categoryId.Value);

        if (type.HasValue)
            query = query.Where(t => t.Type == type.Value);

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderByDescending(t => t.Date)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return new TransactionsPage(items, totalCount);
    }

    public async Task<IReadOnlyList<CategoryTotal>> GetCategoryTotalsAsync(
        Guid userId,
        DateTime from,
        DateTime toExclusive,
        CancellationToken cancellationToken) =>
        await _dbContext.Transactions
            .Where(t => t.UserId == userId
                && t.CategoryId != null
                && t.Date >= from
                && t.Date < toExclusive)
            .GroupBy(t => t.CategoryId!.Value)
            .Select(g => new CategoryTotal(g.Key, g.Sum(t => t.Amount.Amount)))
            .ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<Transaction>> GetLatestAsync(
        Guid userId,
        int limit,
        CancellationToken cancellationToken) =>
        await _dbContext.Transactions
            .Where(t => t.UserId == userId)
            .OrderByDescending(t => t.Date)
            .Take(limit)
            .ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<Transaction>> GetLatestForAccountAsync(
        Guid userId,
        Guid accountId,
        int limit,
        CancellationToken cancellationToken) =>
        await _dbContext.Transactions
            .Where(t => t.UserId == userId && (t.AccountId == accountId || t.ToAccountId == accountId))
            .OrderByDescending(t => t.Date)
            .Take(limit)
            .ToListAsync(cancellationToken);

    public Task<bool> AnyForAccountAsync(Guid userId, Guid accountId, CancellationToken cancellationToken) =>
        _dbContext.Transactions.AnyAsync(
            t => t.UserId == userId && (t.AccountId == accountId || t.ToAccountId == accountId),
            cancellationToken);

    public Task<bool> AnyForCategoryAsync(Guid userId, Guid categoryId, CancellationToken cancellationToken) =>
        _dbContext.Transactions.AnyAsync(
            t => t.UserId == userId && t.CategoryId == categoryId,
            cancellationToken);
}
