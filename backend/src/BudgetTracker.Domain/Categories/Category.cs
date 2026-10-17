using BudgetTracker.Domain.Enums;
using BudgetTracker.Domain.ValueObjects;
using CSharpFunctionalExtensions;
using Shared.SharedKernel;

namespace BudgetTracker.Domain.Categories;

public class Category : Entity<Guid>
{
    public const int MAX_ICON_LENGTH = 50;

    public const int MAX_COLOR_LENGTH = 20;

    public const string DEFAULT_ICON = "default";

    public const string DEFAULT_COLOR = "#888888";

    public CategoryName Name { get; private set; }

    public CategoryType Type { get; private set; }

    public string Icon { get; private set; }

    public string Color { get; private set; }

    public Money? MonthlyLimit { get; private set; }

    public bool IsSystem { get; private set; }

    public bool IsHidden { get; private set; }

    public Guid? UserId { get; private set; }

    private Category(Guid id) : base(id) { }

    private Category(
        Guid id,
        CategoryName name,
        CategoryType type,
        string icon,
        string color,
        Money? monthlyLimit,
        bool isSystem,
        Guid? userId) : base(id)
    {
        Name = name;
        Type = type;
        Icon = icon;
        Color = color;
        MonthlyLimit = monthlyLimit;
        IsSystem = isSystem;
        UserId = userId;
    }

    public static Result<Category, Error> Create(
        CategoryName name,
        CategoryType type,
        Guid? userId = null,
        string? icon = null,
        string? color = null,
        Money? monthlyLimit = null,
        bool isSystem = false)
    {
        if (!Enum.IsDefined(type))
            return GeneralErrors.ValueIsInvalid("тип категории");

        if (isSystem && userId is not null)
            return Error.Validation("category.system.cannot.be.personal", "Системная категория не может принадлежать пользователю");

        if (monthlyLimit is not null && type != CategoryType.Expense)
            return Error.Validation("category.limit.expense.only", "Лимит задаётся только для категорий расходов");

        icon = string.IsNullOrWhiteSpace(icon) ? DEFAULT_ICON : icon.Trim();
        color = string.IsNullOrWhiteSpace(color) ? DEFAULT_COLOR : color.Trim();

        if (icon.Length > MAX_ICON_LENGTH)
            return GeneralErrors.Length("иконки", MAX_ICON_LENGTH);

        if (color.Length > MAX_COLOR_LENGTH)
            return GeneralErrors.Length("цвета", MAX_COLOR_LENGTH);

        return new Category(Guid.NewGuid(), name, type, icon, color, monthlyLimit, isSystem, userId);
    }

    public void Rename(CategoryName name)
    {
        Name = name;
    }

    public void ChangeMonthlyLimit(Money? monthlyLimit)
    {
        if (monthlyLimit is not null && Type != CategoryType.Expense)
            throw new InvalidOperationException("Лимит задаётся только для категорий расходов");

        MonthlyLimit = monthlyLimit;
    }

    public void Hide()
    {
        IsHidden = true;
    }

    public void Show()
    {
        IsHidden = false;
    }
}
