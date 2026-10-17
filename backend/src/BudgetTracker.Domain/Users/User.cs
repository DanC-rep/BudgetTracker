using BudgetTracker.Domain.ValueObjects;
using CSharpFunctionalExtensions;
using Shared.SharedKernel;

namespace BudgetTracker.Domain.Users;

public class User : Entity<Guid>
{
    public const int MAX_NAME_LENGTH = 100;

    public const int MAX_AVATAR_COLOR_LENGTH = 20;

    public const string DEFAULT_AVATAR_COLOR = "#888888";

    public Login Login { get; private set; }

    public Email Email { get; private set; }

    public string PasswordHash { get; private set; }

    public string Name { get; private set; }

    public string AvatarColor { get; private set; }

    public DateTime CreatedAt { get; private set; }

    private User(Guid id) : base(id) { }

    private User(
        Guid id,
        Login login,
        Email email,
        string passwordHash,
        string name,
        string avatarColor,
        DateTime createdAt) : base(id)
    {
        Login = login;
        Email = email;
        PasswordHash = passwordHash;
        Name = name;
        AvatarColor = avatarColor;
        CreatedAt = createdAt;
    }

    public static Result<User, Error> Create(
        Login login,
        Email email,
        string passwordHash,
        string name,
        string? avatarColor = null)
    {
        if (string.IsNullOrWhiteSpace(passwordHash))
            return GeneralErrors.ValueIsRequired("хеш пароля");

        if (string.IsNullOrWhiteSpace(name))
            return GeneralErrors.ValueIsRequired("имя");

        name = name.Trim();

        if (name.Length > MAX_NAME_LENGTH)
            return GeneralErrors.Length("имени", MAX_NAME_LENGTH);

        avatarColor = string.IsNullOrWhiteSpace(avatarColor)
            ? DEFAULT_AVATAR_COLOR
            : avatarColor.Trim();

        if (avatarColor.Length > MAX_AVATAR_COLOR_LENGTH)
            return GeneralErrors.Length("цвета аватара", MAX_AVATAR_COLOR_LENGTH);

        return new User(Guid.NewGuid(), login, email, passwordHash, name, avatarColor, DateTime.UtcNow);
    }
}
