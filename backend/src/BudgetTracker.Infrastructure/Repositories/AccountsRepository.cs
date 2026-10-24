using BudgetTracker.Application.Abstractions;
using BudgetTracker.Domain.Accounts;
using BudgetTracker.Domain.Enums;
using BudgetTracker.Infrastructure.DbContexts;
using Microsoft.EntityFrameworkCore;

namespace BudgetTracker.Infrastructure.Repositories;

public class AccountsRepository : IAccountsRepository
{
    private readonly BudgetTrackerDbContext _dbContext;

    public AccountsRepository(BudgetTrackerDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task AddAsync(Account account, CancellationToken cancellationToken) =>
        await _dbContext.Accounts.AddAsync(account, cancellationToken);

    public Task<Account?> GetByIdAsync(Guid userId, Guid accountId, CancellationToken cancellationToken) =>
        _dbContext.Accounts.FirstOrDefaultAsync(
            a => a.Id == accountId && a.OwnerId == userId,
            cancellationToken);

    public async Task<IReadOnlyList<Account>> GetAllAsync(Guid userId, CancellationToken cancellationToken) =>
        await _dbContext.Accounts
            .Where(a => a.OwnerId == userId)
            .OrderBy(a => a.Name.Value)
            .ToListAsync(cancellationToken);

    public void Update(Account account) =>
        _dbContext.Accounts.Update(account);

    public async Task<Dictionary<Guid, decimal>> GetBalancesAsync(
        Guid userId,
        IReadOnlyCollection<Guid> accountIds,
        CancellationToken cancellationToken)
    {
        if (accountIds.Count == 0)
            return [];

        // Operations on the account itself: income (+), expense and transfer-out (-).
        var ownMovements = await _dbContext.Transactions
            .Where(t => t.UserId == userId && accountIds.Contains(t.AccountId))
            .GroupBy(t => t.AccountId)
            .Select(g => new
            {
                AccountId = g.Key,
                Net = g.Sum(t => t.Type == TransactionType.Income ? t.Amount.Amount : -t.Amount.Amount),
            })
            .ToListAsync(cancellationToken);

        // Transfers arriving at the account from other accounts.
        var incomingTransfers = await _dbContext.Transactions
            .Where(t => t.UserId == userId
                && t.Type == TransactionType.Transfer
                && t.ToAccountId.HasValue
                && accountIds.Contains(t.ToAccountId.Value))
            .GroupBy(t => t.ToAccountId)
            .Select(g => new
            {
                AccountId = g.Key!.Value,
                Net = g.Sum(t => t.Amount.Amount),
            })
            .ToListAsync(cancellationToken);

        var balances = ownMovements.ToDictionary(m => m.AccountId, m => m.Net);
        foreach (var transfer in incomingTransfers)
            balances[transfer.AccountId] = balances.GetValueOrDefault(transfer.AccountId) + transfer.Net;

        return balances;
    }
}
