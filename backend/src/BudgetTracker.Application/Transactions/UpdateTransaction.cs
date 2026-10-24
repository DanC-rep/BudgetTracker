using BudgetTracker.Application.Abstractions;
using BudgetTracker.Domain.Enums;
using BudgetTracker.Domain.ValueObjects;
using CSharpFunctionalExtensions;
using Shared.SharedKernel;

namespace BudgetTracker.Application.Transactions;

public class UpdateTransaction
{
    public record Request(
        Guid TransactionId,
        string Type,
        Guid AccountId,
        Guid? ToAccountId,
        Guid? CategoryId,
        decimal Amount,
        string Currency,
        DateTime Date,
        string? Description);

    private readonly ICurrentUserAccessor _currentUserAccessor;
    private readonly ICategoriesRepository _categoriesRepository;
    private readonly IAccountsRepository _accountsRepository;
    private readonly ITransactionsRepository _transactionsRepository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateTransaction(
        ICurrentUserAccessor currentUserAccessor,
        ICategoriesRepository categoriesRepository,
        IAccountsRepository accountsRepository,
        ITransactionsRepository transactionsRepository,
        IUnitOfWork unitOfWork)
    {
        _currentUserAccessor = currentUserAccessor;
        _categoriesRepository = categoriesRepository;
        _accountsRepository = accountsRepository;
        _transactionsRepository = transactionsRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<TransactionInfo, Error>> ExecuteAsync(Request request, CancellationToken cancellationToken)
    {
        var userId = _currentUserAccessor.UserId;

        var transaction = await _transactionsRepository.GetByIdAsync(userId, request.TransactionId, cancellationToken);
        if (transaction is null)
            return GeneralErrors.NotFound(request.TransactionId, "операция");

        if (!Enum.TryParse<TransactionType>(request.Type, ignoreCase: true, out var type)
            || !Enum.IsDefined(type))
        {
            return GeneralErrors.ValueIsInvalid("тип операции");
        }

        Result<(Money Money, TransactionDescription? Description), Error> prepared;
        if (type == TransactionType.Transfer)
        {
            if (request.ToAccountId is null)
                return GeneralErrors.ValueIsRequired("счёт зачисления");

            prepared = await TransactionValidation.PrepareTransferAsync(
                userId,
                request.AccountId,
                request.ToAccountId.Value,
                request.Amount,
                request.Currency,
                request.Description,
                _accountsRepository,
                cancellationToken);
        }
        else
        {
            if (request.CategoryId is null)
                return GeneralErrors.ValueIsRequired("категория");

            prepared = await TransactionValidation.PrepareIncomeExpenseAsync(
                type == TransactionType.Income ? CategoryType.Income : CategoryType.Expense,
                userId,
                request.AccountId,
                request.CategoryId.Value,
                request.Amount,
                request.Currency,
                request.Description,
                _categoriesRepository,
                _accountsRepository,
                cancellationToken);
        }

        if (prepared.IsFailure)
            return prepared.Error;

        var updated = transaction.Update(
            type,
            prepared.Value.Money,
            TransactionValidation.NormalizeDate(request.Date),
            request.AccountId,
            request.CategoryId,
            request.ToAccountId,
            prepared.Value.Description);
        if (updated.IsFailure)
            return updated.Error;

        _transactionsRepository.Update(transaction);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return TransactionInfo.From(transaction);
    }
}
