using BudgetTracker.Application.Abstractions;
using BudgetTracker.Application.Transactions;
using CSharpFunctionalExtensions;
using Shared.SharedKernel;

namespace BudgetTracker.Application.Reports;

public class GetDashboard
{
    public const int RECENT_TRANSACTIONS_LIMIT = 10;

    public record Response(
        GetTotalBalance.Response TotalBalance,
        IReadOnlyList<TransactionInfo> RecentTransactions,
        IReadOnlyList<GetBudgetStatus.BudgetStatusItem> BudgetStatus);

    private readonly ICurrentUserAccessor _currentUserAccessor;
    private readonly ITransactionsRepository _transactionsRepository;
    private readonly GetTotalBalance _getTotalBalance;
    private readonly GetBudgetStatus _getBudgetStatus;

    public GetDashboard(
        ICurrentUserAccessor currentUserAccessor,
        ITransactionsRepository transactionsRepository,
        GetTotalBalance getTotalBalance,
        GetBudgetStatus getBudgetStatus)
    {
        _currentUserAccessor = currentUserAccessor;
        _transactionsRepository = transactionsRepository;
        _getTotalBalance = getTotalBalance;
        _getBudgetStatus = getBudgetStatus;
    }

    public async Task<Result<Response, Error>> ExecuteAsync(CancellationToken cancellationToken)
    {
        var totalBalance = await _getTotalBalance.ExecuteAsync(cancellationToken);
        if (totalBalance.IsFailure)
            return totalBalance.Error;

        var budgetStatus = await _getBudgetStatus.ExecuteAsync(null, null, cancellationToken);
        if (budgetStatus.IsFailure)
            return budgetStatus.Error;

        var recentTransactions = await _transactionsRepository.GetLatestAsync(
            _currentUserAccessor.UserId, RECENT_TRANSACTIONS_LIMIT, cancellationToken);

        return new Response(
            totalBalance.Value,
            recentTransactions.Select(TransactionInfo.From).ToList(),
            budgetStatus.Value.Items);
    }
}
