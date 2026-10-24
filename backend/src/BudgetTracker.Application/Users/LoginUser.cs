using BudgetTracker.Application.Abstractions;
using BudgetTracker.Domain.ValueObjects;
using CSharpFunctionalExtensions;
using Shared.SharedKernel;

namespace BudgetTracker.Application.Users;

public class LoginUser
{
    public record Request(string Login, string Password);

    public record Response(Guid UserId, string Login, string Email, string Name, string AccessToken);

    private readonly IUsersRepository _usersRepository;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IJwtProvider _jwtProvider;

    public LoginUser(
        IUsersRepository usersRepository,
        IPasswordHasher passwordHasher,
        IJwtProvider jwtProvider)
    {
        _usersRepository = usersRepository;
        _passwordHasher = passwordHasher;
        _jwtProvider = jwtProvider;
    }

    public async Task<Result<Response, Error>> ExecuteAsync(Request request, CancellationToken cancellationToken)
    {
        var login = Login.Create(request.Login);
        if (login.IsFailure)
            return login.Error;

        var user = await _usersRepository.GetByLoginAsync(login.Value, cancellationToken);
        if (user is null || !_passwordHasher.Verify(request.Password, user.PasswordHash))
            return Error.Authentication("auth.invalid.credentials", "Неверный логин или пароль");

        var accessToken = _jwtProvider.GenerateAccessToken(user);

        return new Response(user.Id, user.Login.Value, user.Email.Value, user.Name, accessToken);
    }
}
