using BudgetTracker.Application.Abstractions;
using CSharpFunctionalExtensions;
using Shared.SharedKernel;

namespace BudgetTracker.Application.Categories;

public class GetCategories
{
    private readonly ICurrentUserAccessor _currentUserAccessor;
    private readonly ICategoriesRepository _categoriesRepository;

    public GetCategories(
        ICurrentUserAccessor currentUserAccessor,
        ICategoriesRepository categoriesRepository)
    {
        _currentUserAccessor = currentUserAccessor;
        _categoriesRepository = categoriesRepository;
    }

    public async Task<Result<IReadOnlyList<CategoryInfo>, Error>> ExecuteAsync(
        bool includeHidden,
        CancellationToken cancellationToken)
    {
        var categories = await _categoriesRepository.GetAllAsync(
            _currentUserAccessor.UserId, includeHidden, cancellationToken);

        return categories.Select(CategoryInfo.From).ToList();
    }
}
