using BudgetTracker.Application.Abstractions;
using CSharpFunctionalExtensions;
using Shared.SharedKernel;

namespace BudgetTracker.Application.Transactions;

public class GetTransaction
{
    private readonly ICurrentUserAccessor _currentUserAccessor;
    private readonly ITransactionsRepository _transactionsRepository;

    public GetTransaction(
        ICurrentUserAccessor currentUserAccessor,
        ITransactionsRepository transactionsRepository)
    {
        _currentUserAccessor = currentUserAccessor;
        _transactionsRepository = transactionsRepository;
    }

    public async Task<Result<TransactionInfo, Error>> ExecuteAsync(
        Guid transactionId,
        CancellationToken cancellationToken)
    {
        var transaction = await _transactionsRepository.GetByIdAsync(
            _currentUserAccessor.UserId, transactionId, cancellationToken);
        if (transaction is null)
            return GeneralErrors.NotFound(transactionId, "операция");

        return TransactionInfo.From(transaction);
    }
}
