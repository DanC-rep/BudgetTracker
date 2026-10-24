using BudgetTracker.Application.Abstractions;
using BudgetTracker.Domain.Enums;
using BudgetTracker.Domain.Transactions;
using CSharpFunctionalExtensions;
using Shared.SharedKernel;

namespace BudgetTracker.Application.Transactions;

public class AddTransfer
{
    public record Request(
        Guid FromAccountId,
        Guid ToAccountId,
        decimal Amount,
        string Currency,
        DateTime Date,
        string? Description);

    private readonly ICurrentUserAccessor _currentUserAccessor;
    private readonly IAccountsRepository _accountsRepository;
    private readonly ITransactionsRepository _transactionsRepository;
    private readonly IUnitOfWork _unitOfWork;

    public AddTransfer(
        ICurrentUserAccessor currentUserAccessor,
        IAccountsRepository accountsRepository,
        ITransactionsRepository transactionsRepository,
        IUnitOfWork unitOfWork)
    {
        _currentUserAccessor = currentUserAccessor;
        _accountsRepository = accountsRepository;
        _transactionsRepository = transactionsRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<TransactionInfo, Error>> ExecuteAsync(Request request, CancellationToken cancellationToken)
    {
        var userId = _currentUserAccessor.UserId;

        var prepared = await TransactionValidation.PrepareTransferAsync(
            userId,
            request.FromAccountId,
            request.ToAccountId,
            request.Amount,
            request.Currency,
            request.Description,
            _accountsRepository,
            cancellationToken);
        if (prepared.IsFailure)
            return prepared.Error;

        var transaction = Transaction.Create(
            TransactionType.Transfer,
            prepared.Value.Money,
            TransactionValidation.NormalizeDate(request.Date),
            accountId: request.FromAccountId,
            userId,
            toAccountId: request.ToAccountId,
            description: prepared.Value.Description);
        if (transaction.IsFailure)
            return transaction.Error;

        await _transactionsRepository.AddAsync(transaction.Value, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return TransactionInfo.From(transaction.Value);
    }
}
