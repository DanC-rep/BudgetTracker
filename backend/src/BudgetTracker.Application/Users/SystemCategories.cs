using BudgetTracker.Domain.Enums;

namespace BudgetTracker.Application.Users;

public static class SystemCategories
{
    public static readonly IReadOnlyList<(string Name, CategoryType Type)> Defaults =
    [
        ("Продукты", CategoryType.Expense),
        ("Транспорт", CategoryType.Expense),
        ("Жильё", CategoryType.Expense),
        ("Здоровье", CategoryType.Expense),
        ("Развлечения", CategoryType.Expense),
        ("Зарплата", CategoryType.Income),
        ("Прочий доход", CategoryType.Income),
    ];
}
