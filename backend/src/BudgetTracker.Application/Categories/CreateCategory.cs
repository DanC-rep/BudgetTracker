using BudgetTracker.Application.Abstractions;
using BudgetTracker.Domain.Categories;
using BudgetTracker.Domain.Enums;
using BudgetTracker.Domain.ValueObjects;
using CSharpFunctionalExtensions;
using Shared.SharedKernel;

namespace BudgetTracker.Application.Categories;

public class CreateCategory
{
    public record Request(
        string Name,
        string Type,
        string? Icon,
        string? Color,
        decimal? MonthlyLimit,
        string? Currency);

    private readonly ICurrentUserAccessor _currentUserAccessor;
    private readonly ICategoriesRepository _categoriesRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateCategory(
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
        var name = CategoryName.Create(request.Name);
        if (name.IsFailure)
            return name.Error;

        if (!Enum.TryParse<CategoryType>(request.Type, ignoreCase: true, out var categoryType)
            || !Enum.IsDefined(categoryType))
        {
            return GeneralErrors.ValueIsInvalid("тип категории");
        }

        Money? monthlyLimit = null;
        if (request.MonthlyLimit.HasValue)
        {
            if (string.IsNullOrWhiteSpace(request.Currency))
                return GeneralErrors.ValueIsRequired("валюта");

            var limit = Money.Create(request.MonthlyLimit.Value, request.Currency);
            if (limit.IsFailure)
                return limit.Error;

            monthlyLimit = limit.Value;
        }

        var category = Category.Create(
            name.Value,
            categoryType,
            _currentUserAccessor.UserId,
            request.Icon,
            request.Color,
            monthlyLimit);
        if (category.IsFailure)
            return category.Error;

        await _categoriesRepository.AddAsync(category.Value, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return CategoryInfo.From(category.Value);
    }
}
