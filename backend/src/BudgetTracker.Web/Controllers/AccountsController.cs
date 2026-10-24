using BudgetTracker.Application.Accounts;
using BudgetTracker.Web.Extensions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BudgetTracker.Web.Controllers;

[ApiController]
[Route("api/accounts")]
[Authorize]
public class AccountsController : ControllerBase
{
    private readonly CreateAccount _createAccount;
    private readonly GetAccounts _getAccounts;
    private readonly GetAccountDetails _getAccountDetails;
    private readonly RenameAccount _renameAccount;
    private readonly ArchiveAccount _archiveAccount;

    public AccountsController(
        CreateAccount createAccount,
        GetAccounts getAccounts,
        GetAccountDetails getAccountDetails,
        RenameAccount renameAccount,
        ArchiveAccount archiveAccount)
    {
        _createAccount = createAccount;
        _getAccounts = getAccounts;
        _getAccountDetails = getAccountDetails;
        _renameAccount = renameAccount;
        _archiveAccount = archiveAccount;
    }

    [HttpPost]
    public async Task<IActionResult> Create(
        [FromBody] CreateAccount.Request request,
        CancellationToken cancellationToken)
    {
        var result = await _createAccount.ExecuteAsync(request, cancellationToken);

        return result.ToActionResult(created => CreatedAtAction(
            nameof(GetDetails),
            new { accountId = created.Id },
            created));
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] bool includeArchived = false,
        CancellationToken cancellationToken = default)
    {
        var result = await _getAccounts.ExecuteAsync(includeArchived, cancellationToken);

        return result.ToActionResult(Ok);
    }

    [HttpGet("{accountId:guid}")]
    public async Task<IActionResult> GetDetails(
        Guid accountId,
        [FromQuery] int lastTransactions = GetAccountDetails.DEFAULT_LAST_TRANSACTIONS,
        CancellationToken cancellationToken = default)
    {
        var result = await _getAccountDetails.ExecuteAsync(accountId, lastTransactions, cancellationToken);

        return result.ToActionResult(Ok);
    }

    [HttpPatch("{accountId:guid}/name")]
    public async Task<IActionResult> Rename(
        Guid accountId,
        [FromBody] RenameAccount.Request request,
        CancellationToken cancellationToken)
    {
        var result = await _renameAccount.ExecuteAsync(
            request with { AccountId = accountId },
            cancellationToken);

        return result.ToActionResult(Ok);
    }

    [HttpPost("{accountId:guid}/archive")]
    public async Task<IActionResult> Archive(
        Guid accountId,
        CancellationToken cancellationToken)
    {
        var result = await _archiveAccount.ExecuteAsync(
            new ArchiveAccount.Request(accountId),
            cancellationToken);

        return result.ToActionResult(Ok);
    }
}
