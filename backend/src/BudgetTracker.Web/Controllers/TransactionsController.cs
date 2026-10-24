using BudgetTracker.Application.Transactions;
using BudgetTracker.Web.Extensions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BudgetTracker.Web.Controllers;

[ApiController]
[Route("api/transactions")]
[Authorize]
public class TransactionsController : ControllerBase
{
    private readonly AddIncome _addIncome;
    private readonly AddExpense _addExpense;
    private readonly AddTransfer _addTransfer;
    private readonly GetTransaction _getTransaction;
    private readonly GetTransactions _getTransactions;
    private readonly UpdateTransaction _updateTransaction;
    private readonly DeleteTransaction _deleteTransaction;

    public TransactionsController(
        AddIncome addIncome,
        AddExpense addExpense,
        AddTransfer addTransfer,
        GetTransaction getTransaction,
        GetTransactions getTransactions,
        UpdateTransaction updateTransaction,
        DeleteTransaction deleteTransaction)
    {
        _addIncome = addIncome;
        _addExpense = addExpense;
        _addTransfer = addTransfer;
        _getTransaction = getTransaction;
        _getTransactions = getTransactions;
        _updateTransaction = updateTransaction;
        _deleteTransaction = deleteTransaction;
    }

    [HttpPost("income")]
    public async Task<IActionResult> AddIncome(
        [FromBody] AddIncome.Request request,
        CancellationToken cancellationToken)
    {
        var result = await _addIncome.ExecuteAsync(request, cancellationToken);

        return result.ToActionResult(created => CreatedAtAction(
            nameof(GetById),
            new { transactionId = created.Id },
            created));
    }

    [HttpPost("expense")]
    public async Task<IActionResult> AddExpense(
        [FromBody] AddExpense.Request request,
        CancellationToken cancellationToken)
    {
        var result = await _addExpense.ExecuteAsync(request, cancellationToken);

        return result.ToActionResult(created => CreatedAtAction(
            nameof(GetById),
            new { transactionId = created.Id },
            created));
    }

    [HttpPost("transfer")]
    public async Task<IActionResult> AddTransfer(
        [FromBody] AddTransfer.Request request,
        CancellationToken cancellationToken)
    {
        var result = await _addTransfer.ExecuteAsync(request, cancellationToken);

        return result.ToActionResult(created => CreatedAtAction(
            nameof(GetById),
            new { transactionId = created.Id },
            created));
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] DateTime? from,
        [FromQuery] DateTime? to,
        [FromQuery] Guid? accountId,
        [FromQuery] Guid? categoryId,
        [FromQuery] string? type,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = GetTransactions.DEFAULT_PAGE_SIZE,
        CancellationToken cancellationToken = default)
    {
        var result = await _getTransactions.ExecuteAsync(
            new GetTransactions.Params(from, to, accountId, categoryId, type, page, pageSize),
            cancellationToken);

        return result.ToActionResult(Ok);
    }

    [HttpGet("{transactionId:guid}")]
    public async Task<IActionResult> GetById(
        Guid transactionId,
        CancellationToken cancellationToken)
    {
        var result = await _getTransaction.ExecuteAsync(transactionId, cancellationToken);

        return result.ToActionResult(Ok);
    }

    [HttpPatch("{transactionId:guid}")]
    public async Task<IActionResult> Update(
        Guid transactionId,
        [FromBody] UpdateTransaction.Request request,
        CancellationToken cancellationToken)
    {
        var result = await _updateTransaction.ExecuteAsync(
            request with { TransactionId = transactionId },
            cancellationToken);

        return result.ToActionResult(Ok);
    }

    [HttpDelete("{transactionId:guid}")]
    public async Task<IActionResult> Delete(
        Guid transactionId,
        CancellationToken cancellationToken)
    {
        var result = await _deleteTransaction.ExecuteAsync(
            new DeleteTransaction.Request(transactionId),
            cancellationToken);

        return result.ToActionResult(NoContent);
    }
}
