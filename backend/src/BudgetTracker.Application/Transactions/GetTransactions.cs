using BudgetTracker.Application.Abstractions;
using BudgetTracker.Domain.Enums;
using CSharpFunctionalExtensions;
using Shared.SharedKernel;

namespace BudgetTracker.Application.Transactions;

public class GetTransactions
{
    public const int DEFAULT_PAGE_SIZE = 20;

    public const int MAX_PAGE_SIZE = 100;

    public record Params(
        DateTime? From,
        DateTime? To,
        Guid? AccountId,
        Guid? CategoryId,
        string? Type,
        int Page,
        int PageSize);

    public record Response(
        IReadOnlyList<TransactionInfo> Items,
        int Page,
        int PageSize,
        int TotalCount);

    private readonly ICurrentUserAccessor _currentUserAccessor;
    private readonly ITransactionsRepository _transactionsRepository;

    public GetTransactions(
        ICurrentUserAccessor currentUserAccessor,
        ITransactionsRepository transactionsRepository)
    {
        _currentUserAccessor = currentUserAccessor;
        _transactionsRepository = transactionsRepository;
    }

    public async Task<Result<Response, Error>> ExecuteAsync(Params parameters, CancellationToken cancellationToken)
    {
        TransactionType? type = null;
        if (!string.IsNullOrWhiteSpace(parameters.Type))
        {
            if (!Enum.TryParse<TransactionType>(parameters.Type, ignoreCase: true, out var parsed)
                || !Enum.IsDefined(parsed))
            {
                return GeneralErrors.ValueIsInvalid("тип операции");
            }

            type = parsed;
        }

        var page = Math.Max(1, parameters.Page);
        var pageSize = parameters.PageSize <= 0
            ? DEFAULT_PAGE_SIZE
            : Math.Clamp(parameters.PageSize, 1, MAX_PAGE_SIZE);

        var userId = _currentUserAccessor.UserId;

        // Model binding yields DateTimeKind.Unspecified, which Npgsql rejects for timestamptz.
        var from = parameters.From.HasValue
            ? DateTime.SpecifyKind(parameters.From.Value, DateTimeKind.Utc)
            : (DateTime?)null;
        var to = parameters.To.HasValue
            ? DateTime.SpecifyKind(parameters.To.Value, DateTimeKind.Utc)
            : (DateTime?)null;

        var transactionsPage = await _transactionsRepository.GetAsync(
            userId,
            from,
            to,
            parameters.AccountId,
            parameters.CategoryId,
            type,
            page,
            pageSize,
            cancellationToken);

        return new Response(
            transactionsPage.Items.Select(TransactionInfo.From).ToList(),
            page,
            pageSize,
            transactionsPage.TotalCount);
    }
}
