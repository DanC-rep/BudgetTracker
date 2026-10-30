using BudgetTracker.Application.Abstractions;
using BudgetTracker.Domain.ValueObjects;
using CSharpFunctionalExtensions;
using Shared.SharedKernel;

namespace BudgetTracker.Application.Accounts;

public class RenameAccount
{
    public record Request(Guid AccountId, string Name);

    private readonly ICurrentUserAccessor _currentUserAccessor;
    private readonly IAccountsRepository _accountsRepository;
    private readonly IUnitOfWork _unitOfWork;

    public RenameAccount(
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

        var account = await _accountsRepository.GetByIdAsync(
            _currentUserAccessor.UserId, request.AccountId, cancellationToken);
        if (account is null)
            return GeneralErrors.NotFound(request.AccountId, "счёт");

        account.Rename(name.Value);

        _accountsRepository.Update(account);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var balances = await _accountsRepository.GetBalancesAsync(
            _currentUserAccessor.UserId, [account.Id], cancellationToken);

        return new AccountInfo(
            account.Id,
            account.Name.Value,
            account.Type,
            account.InitialBalance.Amount,
            account.InitialBalance.Currency,
            account.InitialBalance.Amount + balances.GetValueOrDefault(account.Id, 0m),
            account.IsArchived);
    }
}
