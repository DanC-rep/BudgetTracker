using BudgetTracker.Application.Abstractions;
using BudgetTracker.Infrastructure.DbContexts;

namespace BudgetTracker.Infrastructure;

public class UnitOfWork : IUnitOfWork
{
    private readonly BudgetTrackerDbContext _dbContext;

    public UnitOfWork(BudgetTrackerDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public Task<int> SaveChangesAsync(CancellationToken cancellationToken) =>
        _dbContext.SaveChangesAsync(cancellationToken);
}
