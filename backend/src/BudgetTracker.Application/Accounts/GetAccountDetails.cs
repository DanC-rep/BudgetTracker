using BudgetTracker.Application.Abstractions;
using CSharpFunctionalExtensions;
using Shared.SharedKernel;

namespace BudgetTracker.Application.Accounts;

public class GetAccountDetails
{
    public const int DEFAULT_LAST_TRANSACTIONS = 10;

    public const int MAX_LAST_TRANSACTIONS = 100;

    public record TransactionInfo(
        Guid Id,
        string Type,
        decimal Amount,
        string Currency,
        DateTime Date,
        string? Description,
        Guid AccountId,
        Guid? ToAccountId,
        Guid? CategoryId);

    public record Response(
        AccountInfo Account,
        IReadOnlyList<TransactionInfo> LastTransactions);

    private readonly ICurrentUserAccessor _currentUserAccessor;
    private readonly IAccountsRepository _accountsRepository;
    private readonly ITransactionsRepository _transactionsRepository;

    public GetAccountDetails(
        ICurrentUserAccessor currentUserAccessor,
        IAccountsRepository accountsRepository,
        ITransactionsRepository transactionsRepository)
    {
        _currentUserAccessor = currentUserAccessor;
        _accountsRepository = accountsRepository;
        _transactionsRepository = transactionsRepository;
    }

    public async Task<Result<Response, Error>> ExecuteAsync(
        Guid accountId,
        int lastTransactionsCount,
        CancellationToken cancellationToken)
    {
        var userId = _currentUserAccessor.UserId;

        var account = await _accountsRepository.GetByIdAsync(userId, accountId, cancellationToken);
        if (account is null)
            return GeneralErrors.NotFound(accountId, "счёт");

        var count = Math.Clamp(lastTransactionsCount, 1, MAX_LAST_TRANSACTIONS);

        var balances = await _accountsRepository.GetBalancesAsync(userId, [account.Id], cancellationToken);
        var transactions = await _transactionsRepository.GetLatestForAccountAsync(
            userId, account.Id, count, cancellationToken);

        var accountInfo = new AccountInfo(
            account.Id,
            account.Name.Value,
            account.Type.ToString(),
            account.InitialBalance.Amount,
            account.InitialBalance.Currency,
            balances.GetValueOrDefault(account.Id, account.InitialBalance.Amount),
            account.IsArchived);

        var transactionInfos = transactions
            .Select(t => new TransactionInfo(
                t.Id,
                t.Type.ToString(),
                t.Amount.Amount,
                t.Amount.Currency,
                t.Date,
                t.Description?.Value,
                t.AccountId,
                t.ToAccountId,
                t.CategoryId))
            .ToList();

        return new Response(accountInfo, transactionInfos);
    }
}
