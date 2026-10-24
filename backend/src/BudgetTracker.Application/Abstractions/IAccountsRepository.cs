using BudgetTracker.Domain.Accounts;

namespace BudgetTracker.Application.Abstractions;

public interface IAccountsRepository
{
    Task AddAsync(Account account, CancellationToken cancellationToken);

    Task<Account?> GetByIdAsync(Guid userId, Guid accountId, CancellationToken cancellationToken);

    Task<IReadOnlyList<Account>> GetAllAsync(Guid userId, CancellationToken cancellationToken);

    void Update(Account account);

    Task<Dictionary<Guid, decimal>> GetBalancesAsync(
        Guid userId,
        IReadOnlyCollection<Guid> accountIds,
        CancellationToken cancellationToken);
}
