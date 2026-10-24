using BudgetTracker.Application.Abstractions;
using CSharpFunctionalExtensions;
using Shared.SharedKernel;

namespace BudgetTracker.Application.Reports;

public class GetTotalBalance
{
    public record Response(decimal Total, int AccountsCount);

    private readonly ICurrentUserAccessor _currentUserAccessor;
    private readonly IAccountsRepository _accountsRepository;

    public GetTotalBalance(
        ICurrentUserAccessor currentUserAccessor,
        IAccountsRepository accountsRepository)
    {
        _currentUserAccessor = currentUserAccessor;
        _accountsRepository = accountsRepository;
    }

    public async Task<Result<Response, Error>> ExecuteAsync(CancellationToken cancellationToken)
    {
        var userId = _currentUserAccessor.UserId;

        var activeAccounts = (await _accountsRepository.GetAllAsync(userId, cancellationToken))
            .Where(a => !a.IsArchived)
            .ToList();

        var balances = await _accountsRepository.GetBalancesAsync(
            userId, activeAccounts.Select(a => a.Id).ToArray(), cancellationToken);

        var total = activeAccounts.Sum(a => a.InitialBalance.Amount + balances.GetValueOrDefault(a.Id, 0m));

        return new Response(total, activeAccounts.Count);
    }
}
