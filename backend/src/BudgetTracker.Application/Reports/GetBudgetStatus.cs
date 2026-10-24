using BudgetTracker.Application.Abstractions;
using BudgetTracker.Domain.Enums;
using CSharpFunctionalExtensions;
using Shared.SharedKernel;

namespace BudgetTracker.Application.Reports;

public class GetBudgetStatus
{
    public record BudgetStatusItem(
        Guid CategoryId,
        string Name,
        decimal MonthlyLimit,
        string LimitCurrency,
        decimal Spent,
        bool IsExceeded);

    public record Response(IReadOnlyList<BudgetStatusItem> Items);

    private readonly ICurrentUserAccessor _currentUserAccessor;
    private readonly ITransactionsRepository _transactionsRepository;
    private readonly ICategoriesRepository _categoriesRepository;

    public GetBudgetStatus(
        ICurrentUserAccessor currentUserAccessor,
        ITransactionsRepository transactionsRepository,
        ICategoriesRepository categoriesRepository)
    {
        _currentUserAccessor = currentUserAccessor;
        _transactionsRepository = transactionsRepository;
        _categoriesRepository = categoriesRepository;
    }

    public async Task<Result<Response, Error>> ExecuteAsync(
        int? year,
        int? month,
        CancellationToken cancellationToken)
    {
        var today = DateTime.UtcNow;
        var resolvedYear = year ?? today.Year;
        var resolvedMonth = month ?? today.Month;

        if (resolvedYear < 1 || resolvedYear > 9999)
            return GeneralErrors.ValueIsInvalid("год");

        if (resolvedMonth < 1 || resolvedMonth > 12)
            return GeneralErrors.ValueIsInvalid("месяц");

        var userId = _currentUserAccessor.UserId;

        var categories = await _categoriesRepository.GetAllAsync(userId, includeHidden: true, cancellationToken);
        var limitedCategories = categories
            .Where(c => c.Type == CategoryType.Expense && c.MonthlyLimit is not null)
            .ToList();

        var from = new DateTime(resolvedYear, resolvedMonth, 1, 0, 0, 0, DateTimeKind.Utc);
        var toExclusive = from.AddMonths(1);

        var totals = await _transactionsRepository.GetCategoryTotalsAsync(
            userId, from, toExclusive, cancellationToken);
        var totalsByCategory = totals.ToDictionary(t => t.CategoryId, t => t.Total);

        var items = limitedCategories
            .Select(c =>
            {
                var spent = totalsByCategory.GetValueOrDefault(c.Id, 0m);
                var limit = c.MonthlyLimit!;
                return new BudgetStatusItem(
                    c.Id,
                    c.Name.Value,
                    limit.Amount,
                    limit.Currency,
                    spent,
                    IsExceeded: spent > limit.Amount);
            })
            .OrderBy(i => i.Name)
            .ToList();

        return new Response(items);
    }
}
