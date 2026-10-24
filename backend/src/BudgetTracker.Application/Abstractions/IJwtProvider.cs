using BudgetTracker.Domain.Users;

namespace BudgetTracker.Application.Abstractions;

public interface IJwtProvider
{
    string GenerateAccessToken(User user);
}
