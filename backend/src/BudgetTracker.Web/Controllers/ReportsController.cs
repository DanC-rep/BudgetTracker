using BudgetTracker.Application.Reports;
using BudgetTracker.Web.Extensions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BudgetTracker.Web.Controllers;

[ApiController]
[Route("api/reports")]
[Authorize]
public class ReportsController : ControllerBase
{
    private readonly GetMonthlySummary _getMonthlySummary;
    private readonly GetBudgetStatus _getBudgetStatus;
    private readonly GetTotalBalance _getTotalBalance;
    private readonly GetDashboard _getDashboard;

    public ReportsController(
        GetMonthlySummary getMonthlySummary,
        GetBudgetStatus getBudgetStatus,
        GetTotalBalance getTotalBalance,
        GetDashboard getDashboard)
    {
        _getMonthlySummary = getMonthlySummary;
        _getBudgetStatus = getBudgetStatus;
        _getTotalBalance = getTotalBalance;
        _getDashboard = getDashboard;
    }

    [HttpGet("monthly-summary")]
    public async Task<IActionResult> GetMonthlySummary(
        [FromQuery] int year,
        [FromQuery] int month,
        CancellationToken cancellationToken)
    {
        var result = await _getMonthlySummary.ExecuteAsync(year, month, cancellationToken);

        return result.ToActionResult(Ok);
    }

    [HttpGet("budget-status")]
    public async Task<IActionResult> GetBudgetStatus(
        [FromQuery] int? year,
        [FromQuery] int? month,
        CancellationToken cancellationToken)
    {
        var result = await _getBudgetStatus.ExecuteAsync(year, month, cancellationToken);

        return result.ToActionResult(Ok);
    }

    [HttpGet("total-balance")]
    public async Task<IActionResult> GetTotalBalance(CancellationToken cancellationToken)
    {
        var result = await _getTotalBalance.ExecuteAsync(cancellationToken);

        return result.ToActionResult(Ok);
    }

    [HttpGet("dashboard")]
    public async Task<IActionResult> GetDashboard(CancellationToken cancellationToken)
    {
        var result = await _getDashboard.ExecuteAsync(cancellationToken);

        return result.ToActionResult(Ok);
    }
}
