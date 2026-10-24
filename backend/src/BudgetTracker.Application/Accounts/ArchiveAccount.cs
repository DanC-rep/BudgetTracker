using BudgetTracker.Application.Abstractions;
using CSharpFunctionalExtensions;
using Shared.SharedKernel;

namespace BudgetTracker.Application.Accounts;

public class ArchiveAccount
{
    public record Request(Guid AccountId);

    private readonly ICurrentUserAccessor _currentUserAccessor;
    private readonly IAccountsRepository _accountsRepository;
    private readonly IUnitOfWork _unitOfWork;

    public ArchiveAccount(
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
        var account = await _accountsRepository.GetByIdAsync(
            _currentUserAccessor.UserId, request.AccountId, cancellationToken);
        if (account is null)
            return GeneralErrors.NotFound(request.AccountId, "счёт");

        account.Archive();

        _accountsRepository.Update(account);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var balances = await _accountsRepository.GetBalancesAsync(
            _currentUserAccessor.UserId, [account.Id], cancellationToken);

        return new AccountInfo(
            account.Id,
            account.Name.Value,
            account.Type.ToString(),
            account.InitialBalance.Amount,
            account.InitialBalance.Currency,
            balances.GetValueOrDefault(account.Id, account.InitialBalance.Amount),
            account.IsArchived);
    }
}
