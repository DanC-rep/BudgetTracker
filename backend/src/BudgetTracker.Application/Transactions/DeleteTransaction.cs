using BudgetTracker.Application.Abstractions;
using CSharpFunctionalExtensions;
using Shared.SharedKernel;

namespace BudgetTracker.Application.Transactions;

public class DeleteTransaction
{
    public record Request(Guid TransactionId);

    private readonly ICurrentUserAccessor _currentUserAccessor;
    private readonly ITransactionsRepository _transactionsRepository;
    private readonly IUnitOfWork _unitOfWork;

    public DeleteTransaction(
        ICurrentUserAccessor currentUserAccessor,
        ITransactionsRepository transactionsRepository,
        IUnitOfWork unitOfWork)
    {
        _currentUserAccessor = currentUserAccessor;
        _transactionsRepository = transactionsRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<UnitResult<Error>> ExecuteAsync(Request request, CancellationToken cancellationToken)
    {
        var transaction = await _transactionsRepository.GetByIdAsync(
            _currentUserAccessor.UserId, request.TransactionId, cancellationToken);
        if (transaction is null)
            return GeneralErrors.NotFound(request.TransactionId, "операция");

        _transactionsRepository.Delete(transaction);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return UnitResult.Success<Error>();
    }
}
