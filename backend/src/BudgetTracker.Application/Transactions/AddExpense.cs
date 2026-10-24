using BudgetTracker.Application.Abstractions;
using BudgetTracker.Domain.Enums;
using BudgetTracker.Domain.Transactions;
using CSharpFunctionalExtensions;
using Shared.SharedKernel;

namespace BudgetTracker.Application.Transactions;

public class AddExpense
{
    public record Request(
        Guid AccountId,
        Guid CategoryId,
        decimal Amount,
        string Currency,
        DateTime Date,
        string? Description);

    private readonly ICurrentUserAccessor _currentUserAccessor;
    private readonly ICategoriesRepository _categoriesRepository;
    private readonly IAccountsRepository _accountsRepository;
    private readonly ITransactionsRepository _transactionsRepository;
    private readonly IUnitOfWork _unitOfWork;

    public AddExpense(
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

        var prepared = await TransactionValidation.PrepareIncomeExpenseAsync(
            CategoryType.Expense,
            userId,
            request.AccountId,
            request.CategoryId,
            request.Amount,
            request.Currency,
            request.Description,
            _categoriesRepository,
            _accountsRepository,
            cancellationToken);
        if (prepared.IsFailure)
            return prepared.Error;

        var transaction = Transaction.Create(
            TransactionType.Expense,
            prepared.Value.Money,
            TransactionValidation.NormalizeDate(request.Date),
            request.AccountId,
            userId,
            request.CategoryId,
            description: prepared.Value.Description);
        if (transaction.IsFailure)
            return transaction.Error;

        await _transactionsRepository.AddAsync(transaction.Value, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return TransactionInfo.From(transaction.Value);
    }
}
