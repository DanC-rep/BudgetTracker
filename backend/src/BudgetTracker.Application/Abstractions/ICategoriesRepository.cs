using BudgetTracker.Domain.Categories;

namespace BudgetTracker.Application.Abstractions;

public interface ICategoriesRepository
{
    Task<bool> ExistsSystemByNameAsync(string name, CancellationToken cancellationToken);

    Task AddAsync(Category category, CancellationToken cancellationToken);

    Task<Category?> GetByIdAsync(Guid userId, Guid categoryId, CancellationToken cancellationToken);

    Task<IReadOnlyList<Category>> GetAllAsync(Guid userId, bool includeHidden, CancellationToken cancellationToken);

    void Update(Category category);

    void Delete(Category category);
}
