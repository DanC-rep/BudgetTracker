using BudgetTracker.Domain.Enums;
using BudgetTracker.Domain.ValueObjects;
using CSharpFunctionalExtensions;
using Shared.SharedKernel;

namespace BudgetTracker.Domain.Categories;

public class Category : Entity<Guid>
{
    public CategoryName Name { get; private set; }

    public CategoryType Type { get; private set; }

    public Guid? UserId { get; private set; }

    private Category(Guid id) : base(id) { }

    private Category(Guid id, CategoryName name, CategoryType type, Guid? userId) : base(id)
    {
        Name = name;
        Type = type;
        UserId = userId;
    }

    public static Result<Category, Error> Create(CategoryName name, CategoryType type, Guid? userId = null)
    {
        if (!Enum.IsDefined(type))
            return GeneralErrors.ValueIsInvalid("тип категории");

        return new Category(Guid.NewGuid(), name, type, userId);
    }

    public void Rename(CategoryName name)
    {
        Name = name;
    }
}
