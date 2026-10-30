using BudgetTracker.Domain.Categories;
using BudgetTracker.Domain.Enums;

namespace BudgetTracker.Application.Categories;

public sealed record CategoryInfo(
    Guid Id,
    string Name,
    CategoryType Type,
    string Icon,
    string Color,
    decimal? MonthlyLimit,
    string? LimitCurrency,
    bool IsSystem,
    bool IsHidden,
    bool IsPersonal)
{
    public static CategoryInfo From(Category category) =>
        new(
            category.Id,
            category.Name.Value,
            category.Type,
            category.Icon,
            category.Color,
            category.MonthlyLimit?.Amount,
            category.MonthlyLimit?.Currency,
            category.IsSystem,
            category.IsHidden,
            category.UserId is not null);
}
