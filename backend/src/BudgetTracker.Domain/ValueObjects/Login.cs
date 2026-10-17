using System.Text.RegularExpressions;
using CSharpFunctionalExtensions;
using Shared.SharedKernel;

namespace BudgetTracker.Domain.ValueObjects;

public partial class Login : ValueObject
{
    public const int MAX_LOGIN_LENGTH = 50;

    public string Value { get; private set; }

    private Login() { }

    private Login(string value) => Value = value;

    public static Result<Login, Error> Create(string login)
    {
        if (string.IsNullOrWhiteSpace(login))
            return GeneralErrors.ValueIsRequired("логин");

        login = login.Trim();

        if (login.Length > MAX_LOGIN_LENGTH)
            return GeneralErrors.Length("логина", MAX_LOGIN_LENGTH);

        if (!LoginRegex().IsMatch(login))
            return GeneralErrors.ValueIsInvalid("логин (допустимы буквы, цифры, _, ., -)");

        return new Login(login);
    }

    [GeneratedRegex(@"^[a-zA-Z0-9_.\-]+$")]
    private static partial Regex LoginRegex();

    protected override IEnumerable<object> GetEqualityComponents()
    {
        yield return Value;
    }
}
