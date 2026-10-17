using BudgetTracker.Domain.ValueObjects;
using CSharpFunctionalExtensions;
using Shared.SharedKernel;

namespace BudgetTracker.Domain.Users;

public class User : Entity<Guid>
{
    public Email Email { get; private set; }

    public string PasswordHash { get; private set; }

    public DateTime CreatedAt { get; private set; }

    private User(Guid id) : base(id) { }

    private User(Guid id, Email email, string passwordHash, DateTime createdAt) : base(id)
    {
        Email = email;
        PasswordHash = passwordHash;
        CreatedAt = createdAt;
    }

    public static Result<User, Error> Create(Email email, string passwordHash)
    {
        if (string.IsNullOrWhiteSpace(passwordHash))
            return GeneralErrors.ValueIsRequired("хеш пароля");

        return new User(Guid.NewGuid(), email, passwordHash, DateTime.UtcNow);
    }
}
