using BudgetTracker.Application.Abstractions;
using CSharpFunctionalExtensions;
using Shared.SharedKernel;

namespace BudgetTracker.Application.Accounts;

public class GetAccounts
{
    private readonly ICurrentUserAccessor _currentUserAccessor;
    private readonly IAccountsRepository _accountsRepository;

    public GetAccounts(
        ICurrentUserAccessor currentUserAccessor,
        IAccountsRepository accountsRepository)
    {
        _currentUserAccessor = currentUserAccessor;
        _accountsRepository = accountsRepository;
    }

    public async Task<Result<IReadOnlyList<AccountInfo>, Error>> ExecuteAsync(
        bool includeArchived,
        CancellationToken cancellationToken)
    {
        var userId = _currentUserAccessor.UserId;

        var accounts = await _accountsRepository.GetAllAsync(userId, cancellationToken);

        var visibleAccounts = accounts.Where(a => includeArchived || !a.IsArchived).ToList();

        var balances = await _accountsRepository.GetBalancesAsync(
            userId, visibleAccounts.Select(a => a.Id).ToArray(), cancellationToken);

        return visibleAccounts
            .Select(a => new AccountInfo(
                a.Id,
                a.Name.Value,
                a.Type,
                a.InitialBalance.Amount,
                a.InitialBalance.Currency,
                a.InitialBalance.Amount + balances.GetValueOrDefault(a.Id, 0m),
                a.IsArchived))
            .ToList();
    }
}
