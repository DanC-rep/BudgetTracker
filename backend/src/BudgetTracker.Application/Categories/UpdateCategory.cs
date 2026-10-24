using BudgetTracker.Application.Abstractions;
using BudgetTracker.Domain.ValueObjects;
using CSharpFunctionalExtensions;
using Shared.SharedKernel;

namespace BudgetTracker.Application.Categories;

public class UpdateCategory
{
    public record Request(
        Guid CategoryId,
        string? Name,
        string? Icon,
        string? Color,
        decimal? MonthlyLimit,
        bool ClearMonthlyLimit,
        string? Currency);

    private readonly ICurrentUserAccessor _currentUserAccessor;
    private readonly ICategoriesRepository _categoriesRepository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateCategory(
        ICurrentUserAccessor currentUserAccessor,
        ICategoriesRepository categoriesRepository,
        IUnitOfWork unitOfWork)
    {
        _currentUserAccessor = currentUserAccessor;
        _categoriesRepository = categoriesRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<CategoryInfo, Error>> ExecuteAsync(Request request, CancellationToken cancellationToken)
    {
        var category = await _categoriesRepository.GetByIdAsync(
            _currentUserAccessor.UserId, request.CategoryId, cancellationToken);
        if (category is null)
            return GeneralErrors.NotFound(request.CategoryId, "категория");

        if (category.IsSystem)
            return Error.Validation("category.system.readonly", "Системную категорию нельзя изменить");

        if (request.Name is not null)
        {
            var name = CategoryName.Create(request.Name);
            if (name.IsFailure)
                return name.Error;

            category.Rename(name.Value);
        }

        if (request.Icon is not null)
        {
            var icon = category.ChangeIcon(request.Icon);
            if (icon.IsFailure)
                return icon.Error;
        }

        if (request.Color is not null)
        {
            var color = category.ChangeColor(request.Color);
            if (color.IsFailure)
                return color.Error;
        }

        if (request.ClearMonthlyLimit)
        {
            var cleared = category.ChangeMonthlyLimit(null);
            if (cleared.IsFailure)
                return cleared.Error;
        }
        else if (request.MonthlyLimit.HasValue)
        {
            var currency = request.Currency
                ?? category.MonthlyLimit?.Currency
                ?? "RUB";

            var limit = Money.Create(request.MonthlyLimit.Value, currency);
            if (limit.IsFailure)
                return limit.Error;

            var changed = category.ChangeMonthlyLimit(limit.Value);
            if (changed.IsFailure)
                return changed.Error;
        }

        _categoriesRepository.Update(category);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return CategoryInfo.From(category);
    }
}
