using BudgetTracker.Application.Abstractions;
using CSharpFunctionalExtensions;
using Shared.SharedKernel;

namespace BudgetTracker.Application.Categories;

public class DeleteCategory
{
    public record Request(Guid CategoryId);

    private readonly ICurrentUserAccessor _currentUserAccessor;
    private readonly ICategoriesRepository _categoriesRepository;
    private readonly ITransactionsRepository _transactionsRepository;
    private readonly IUnitOfWork _unitOfWork;

    public DeleteCategory(
        ICurrentUserAccessor currentUserAccessor,
        ICategoriesRepository categoriesRepository,
        ITransactionsRepository transactionsRepository,
        IUnitOfWork unitOfWork)
    {
        _currentUserAccessor = currentUserAccessor;
        _categoriesRepository = categoriesRepository;
        _transactionsRepository = transactionsRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<UnitResult<Error>> ExecuteAsync(Request request, CancellationToken cancellationToken)
    {
        var userId = _currentUserAccessor.UserId;

        var category = await _categoriesRepository.GetByIdAsync(userId, request.CategoryId, cancellationToken);
        if (category is null)
            return GeneralErrors.NotFound(request.CategoryId, "категория");

        if (category.IsSystem)
            return Error.Validation("category.system.cannot.delete", "Системную категорию удалить нельзя");

        var hasTransactions = await _transactionsRepository.AnyForCategoryAsync(
            userId, category.Id, cancellationToken);
        if (hasTransactions)
        {
            return Error.Conflict(
                "category.has.transactions",
                "Категория используется в операциях — вместо удаления её можно скрыть");
        }

        _categoriesRepository.Delete(category);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return UnitResult.Success<Error>();
    }
}
