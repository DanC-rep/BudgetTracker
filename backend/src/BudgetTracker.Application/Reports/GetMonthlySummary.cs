using BudgetTracker.Application.Abstractions;
using BudgetTracker.Domain.Enums;
using CSharpFunctionalExtensions;
using Shared.SharedKernel;

namespace BudgetTracker.Application.Reports;

public class GetMonthlySummary
{
    public record CategoryBreakdown(Guid CategoryId, string Name, CategoryType Type, decimal Total);

    public record Response(
        decimal TotalIncome,
        decimal TotalExpense,
        decimal Net,
        IReadOnlyList<CategoryBreakdown> ByCategory);

    private readonly ICurrentUserAccessor _currentUserAccessor;
    private readonly ITransactionsRepository _transactionsRepository;
    private readonly ICategoriesRepository _categoriesRepository;

    public GetMonthlySummary(
        ICurrentUserAccessor currentUserAccessor,
        ITransactionsRepository transactionsRepository,
        ICategoriesRepository categoriesRepository)
    {
        _currentUserAccessor = currentUserAccessor;
        _transactionsRepository = transactionsRepository;
        _categoriesRepository = categoriesRepository;
    }

    public async Task<Result<Response, Error>> ExecuteAsync(int year, int month, CancellationToken cancellationToken)
    {
        if (year < 1 || year > 9999)
            return GeneralErrors.ValueIsInvalid("год");

        if (month < 1 || month > 12)
            return GeneralErrors.ValueIsInvalid("месяц");

        var userId = _currentUserAccessor.UserId;

        var from = new DateTime(year, month, 1, 0, 0, 0, DateTimeKind.Utc);
        var toExclusive = from.AddMonths(1);

        var totals = await _transactionsRepository.GetCategoryTotalsAsync(
            userId, from, toExclusive, cancellationToken);

        var categories = (await _categoriesRepository.GetAllAsync(userId, includeHidden: true, cancellationToken))
            .ToDictionary(c => c.Id);

        var byCategory = totals
            .Where(t => categories.ContainsKey(t.CategoryId))
            .Select(t =>
            {
                var category = categories[t.CategoryId];
                return new CategoryBreakdown(
                    category.Id,
                    category.Name.Value,
                    category.Type,
                    t.Total);
            })
            .ToList();

        var totalIncome = byCategory
            .Where(b => b.Type == CategoryType.Income)
            .Sum(b => b.Total);
        var totalExpense = byCategory
            .Where(b => b.Type == CategoryType.Expense)
            .Sum(b => b.Total);

        return new Response(totalIncome, totalExpense, totalIncome - totalExpense, byCategory);
    }
}
