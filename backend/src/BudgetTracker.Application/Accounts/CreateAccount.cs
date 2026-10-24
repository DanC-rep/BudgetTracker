using BudgetTracker.Application.Abstractions;
using BudgetTracker.Domain.Accounts;
using BudgetTracker.Domain.Enums;
using BudgetTracker.Domain.ValueObjects;
using CSharpFunctionalExtensions;
using Shared.SharedKernel;

namespace BudgetTracker.Application.Accounts;

public class CreateAccount
{
    public record Request(string Name, string Type, decimal InitialBalance, string Currency);

    private readonly ICurrentUserAccessor _currentUserAccessor;
    private readonly IAccountsRepository _accountsRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateAccount(
        ICurrentUserAccessor currentUserAccessor,
        IAccountsRepository accountsRepository,
        IUnitOfWork unitOfWork)
    {
        _currentUserAccessor = currentUserAccessor;
        _accountsRepository = accountsRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<AccountInfo, Error>> ExecuteAsync(Request request, CancellationToken cancellationToken)
    {
        var name = AccountName.Create(request.Name);
        if (name.IsFailure)
            return name.Error;

        if (!Enum.TryParse<AccountType>(request.Type, ignoreCase: true, out var accountType)
            || !Enum.IsDefined(accountType))
        {
            return GeneralErrors.ValueIsInvalid("тип счёта");
        }

        var initialBalance = Money.CreateNonNegative(request.InitialBalance, request.Currency);
        if (initialBalance.IsFailure)
            return initialBalance.Error;

        var userId = _currentUserAccessor.UserId;

        var account = Account.Create(name.Value, accountType, initialBalance.Value, userId);
        if (account.IsFailure)
            return account.Error;

        await _accountsRepository.AddAsync(account.Value, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new AccountInfo(
            account.Value.Id,
            account.Value.Name.Value,
            account.Value.Type.ToString(),
            account.Value.InitialBalance.Amount,
            account.Value.InitialBalance.Currency,
            account.Value.InitialBalance.Amount,
            account.Value.IsArchived);
    }
}
