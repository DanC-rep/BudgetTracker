using BudgetTracker.Application.Abstractions;
using BudgetTracker.Domain.Categories;
using BudgetTracker.Infrastructure.DbContexts;
using Microsoft.EntityFrameworkCore;

namespace BudgetTracker.Infrastructure.Repositories;

public class CategoriesRepository : ICategoriesRepository
{
    private readonly BudgetTrackerDbContext _dbContext;

    public CategoriesRepository(BudgetTrackerDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public Task<bool> ExistsSystemByNameAsync(string name, CancellationToken cancellationToken) =>
        _dbContext.Categories.AnyAsync(
            c => c.IsSystem && c.Name.Value == name,
            cancellationToken);

    public async Task AddAsync(Category category, CancellationToken cancellationToken) =>
        await _dbContext.Categories.AddAsync(category, cancellationToken);

    public Task<Category?> GetByIdAsync(Guid userId, Guid categoryId, CancellationToken cancellationToken) =>
        _dbContext.Categories.FirstOrDefaultAsync(
            c => c.Id == categoryId && (c.UserId == null || c.UserId == userId),
            cancellationToken);

    public async Task<IReadOnlyList<Category>> GetAllAsync(
        Guid userId,
        bool includeHidden,
        CancellationToken cancellationToken) =>
        await _dbContext.Categories
            .Where(c => (c.UserId == null || c.UserId == userId) && (includeHidden || !c.IsHidden))
            .OrderBy(c => c.Type)
            .ThenBy(c => c.Name.Value)
            .ToListAsync(cancellationToken);

    public void Update(Category category) =>
        _dbContext.Categories.Update(category);

    public void Delete(Category category) =>
        _dbContext.Categories.Remove(category);
}
