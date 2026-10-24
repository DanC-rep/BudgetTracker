using BudgetTracker.Application.Abstractions;
using CSharpFunctionalExtensions;
using Shared.SharedKernel;

namespace BudgetTracker.Application.Categories;

public class ShowCategory
{
    public record Request(Guid CategoryId);

    private readonly ICurrentUserAccessor _currentUserAccessor;
    private readonly ICategoriesRepository _categoriesRepository;
    private readonly IUnitOfWork _unitOfWork;

    public ShowCategory(
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

        category.Show();

        _categoriesRepository.Update(category);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return CategoryInfo.From(category);
    }
}
