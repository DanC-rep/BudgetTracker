using System.Text.RegularExpressions;
using CSharpFunctionalExtensions;
using Shared.SharedKernel;

namespace BudgetTracker.Domain.ValueObjects;

public partial class Email : ValueObject
{
    public const int MAX_EMAIL_LENGTH = 256;

    public string Value { get; private set; }

    private Email() { }

    private Email(string value) => Value = value;

    public static Result<Email, Error> Create(string email)
    {
        if (string.IsNullOrWhiteSpace(email))
            return GeneralErrors.ValueIsRequired("email");

        email = email.Trim().ToLowerInvariant();

        if (email.Length > MAX_EMAIL_LENGTH)
            return GeneralErrors.Length("email", MAX_EMAIL_LENGTH);

        if (!EmailRegex().IsMatch(email))
            return GeneralErrors.ValueIsInvalid("email");

        return new Email(email);
    }

    [GeneratedRegex(@"^[^@\s]+@[^@\s]+\.[^@\s]+$")]
    private static partial Regex EmailRegex();

    protected override IEnumerable<object> GetEqualityComponents()
    {
        yield return Value;
    }
}
