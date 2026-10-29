using BudgetTracker.Application.Abstractions;
using BudgetTracker.Domain.Users;
using BudgetTracker.Domain.ValueObjects;
using BudgetTracker.Infrastructure.DbContexts;
using Microsoft.EntityFrameworkCore;

namespace BudgetTracker.Infrastructure.Repositories;

public class UsersRepository : IUsersRepository
{
    private readonly BudgetTrackerDbContext _dbContext;

    public UsersRepository(BudgetTrackerDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public Task<bool> ExistsByLoginAsync(Login login, CancellationToken cancellationToken) =>
        _dbContext.Users.AnyAsync(u => u.Login.Value == login.Value, cancellationToken);

    public Task<bool> ExistsByEmailAsync(Email email, CancellationToken cancellationToken) =>
        _dbContext.Users.AnyAsync(u => u.Email.Value == email.Value, cancellationToken);

    public async Task AddAsync(User user, CancellationToken cancellationToken) =>
        await _dbContext.Users.AddAsync(user, cancellationToken);

    public Task<User?> GetByLoginAsync(Login login, CancellationToken cancellationToken) =>
        _dbContext.Users.FirstOrDefaultAsync(u => u.Login.Value == login.Value, cancellationToken);

    public Task<User?> GetByIdAsync(Guid id, CancellationToken cancellationToken) =>
        _dbContext.Users.FirstOrDefaultAsync(u => u.Id == id, cancellationToken);
}
