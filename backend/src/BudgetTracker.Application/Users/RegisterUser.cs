using BudgetTracker.Application.Abstractions;
using BudgetTracker.Domain.Categories;
using BudgetTracker.Domain.Users;
using BudgetTracker.Domain.ValueObjects;
using CSharpFunctionalExtensions;
using Shared.SharedKernel;

namespace BudgetTracker.Application.Users;

public class RegisterUser
{
    public const int MIN_PASSWORD_LENGTH = 6;

    public const int MAX_PASSWORD_LENGTH = 100;

    public record Request(string Login, string Email, string Password, string Name, string? AvatarColor);

    public record Response(Guid UserId, string Login, string Email, string Name, string AccessToken);

    private readonly IUsersRepository _usersRepository;
    private readonly ICategoriesRepository _categoriesRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IJwtProvider _jwtProvider;

    public RegisterUser(
        IUsersRepository usersRepository,
        ICategoriesRepository categoriesRepository,
        IUnitOfWork unitOfWork,
        IPasswordHasher passwordHasher,
        IJwtProvider jwtProvider)
    {
        _usersRepository = usersRepository;
        _categoriesRepository = categoriesRepository;
        _unitOfWork = unitOfWork;
        _passwordHasher = passwordHasher;
        _jwtProvider = jwtProvider;
    }

    public async Task<Result<Response, Error>> ExecuteAsync(Request request, CancellationToken cancellationToken)
    {
        var login = Login.Create(request.Login);
        if (login.IsFailure)
            return login.Error;

        var email = Email.Create(request.Email);
        if (email.IsFailure)
            return email.Error;

        if (string.IsNullOrWhiteSpace(request.Password)
            || request.Password.Length < MIN_PASSWORD_LENGTH
            || request.Password.Length > MAX_PASSWORD_LENGTH)
        {
            return Error.Validation(
                "user.password.length",
                $"Пароль обязателен и должен быть от {MIN_PASSWORD_LENGTH} до {MAX_PASSWORD_LENGTH} символов",
                "password");
        }

        if (await _usersRepository.ExistsByLoginAsync(login.Value, cancellationToken))
            return Error.Conflict("user.login.already.exists", "Пользователь с таким логином уже существует", "login");

        if (await _usersRepository.ExistsByEmailAsync(email.Value, cancellationToken))
            return Error.Conflict("user.email.already.exists", "Пользователь с таким email уже существует", "email");

        var passwordHash = _passwordHasher.Hash(request.Password);

        var user = User.Create(login.Value, email.Value, passwordHash, request.Name, request.AvatarColor);
        if (user.IsFailure)
            return user.Error;

        await _usersRepository.AddAsync(user.Value, cancellationToken);
        await SeedSystemCategoriesAsync(cancellationToken);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var accessToken = _jwtProvider.GenerateAccessToken(user.Value);

        return new Response(
            user.Value.Id,
            user.Value.Login.Value,
            user.Value.Email.Value,
            user.Value.Name,
            accessToken);
    }

    private async Task SeedSystemCategoriesAsync(CancellationToken cancellationToken)
    {
        foreach (var (name, type) in SystemCategories.Defaults)
        {
            if (await _categoriesRepository.ExistsSystemByNameAsync(name, cancellationToken))
                continue;

            var category = Category.Create(
                CategoryName.Create(name).Value,
                type,
                isSystem: true);

            if (category.IsSuccess)
                await _categoriesRepository.AddAsync(category.Value, cancellationToken);
        }
    }
}
