using BudgetTracker.Application.Abstractions;
using CSharpFunctionalExtensions;
using Shared.SharedKernel;

namespace BudgetTracker.Application.Users;

public class GetCurrentUser
{
    public record Response(Guid UserId, string Login, string Email, string Name, string AvatarColor);

    private readonly ICurrentUserAccessor _currentUserAccessor;
    private readonly IUsersRepository _usersRepository;

    public GetCurrentUser(
        ICurrentUserAccessor currentUserAccessor,
        IUsersRepository usersRepository)
    {
        _currentUserAccessor = currentUserAccessor;
        _usersRepository = usersRepository;
    }

    public async Task<Result<Response, Error>> ExecuteAsync(CancellationToken cancellationToken)
    {
        var user = await _usersRepository.GetByIdAsync(_currentUserAccessor.UserId, cancellationToken);
        if (user is null)
            return GeneralErrors.NotFound(_currentUserAccessor.UserId, "пользователь");

        return new Response(user.Id, user.Login.Value, user.Email.Value, user.Name, user.AvatarColor);
    }
}
