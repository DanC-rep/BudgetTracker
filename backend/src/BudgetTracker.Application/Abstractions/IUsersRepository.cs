using BudgetTracker.Domain.Users;
using BudgetTracker.Domain.ValueObjects;

namespace BudgetTracker.Application.Abstractions;

public interface IUsersRepository
{
    Task<bool> ExistsByLoginAsync(Login login, CancellationToken cancellationToken);

    Task<bool> ExistsByEmailAsync(Email email, CancellationToken cancellationToken);

    Task AddAsync(User user, CancellationToken cancellationToken);

    Task<User?> GetByLoginAsync(Login login, CancellationToken cancellationToken);

    Task<User?> GetByIdAsync(Guid id, CancellationToken cancellationToken);
}
