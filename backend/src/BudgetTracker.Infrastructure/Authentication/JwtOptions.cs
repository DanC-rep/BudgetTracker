using Microsoft.Extensions.Options;

namespace BudgetTracker.Infrastructure.Authentication;

public class JwtOptions
{
    public const string SectionName = "Jwt";

    public const int MIN_SIGNING_KEY_LENGTH = 32;

    public string Issuer { get; set; } = string.Empty;

    public string Audience { get; set; } = string.Empty;

    public string SigningKey { get; set; } = string.Empty;
}

public class JwtOptionsValidator : IValidateOptions<JwtOptions>
{
    public ValidateOptionsResult Validate(string? name, JwtOptions options)
    {
        var failures = new List<string>();

        if (string.IsNullOrWhiteSpace(options.Issuer))
            failures.Add($"{nameof(options.Issuer)} is required.");

        if (string.IsNullOrWhiteSpace(options.Audience))
            failures.Add($"{nameof(options.Audience)} is required.");

        if (string.IsNullOrWhiteSpace(options.SigningKey))
            failures.Add($"{nameof(options.SigningKey)} is required.");
        else if (options.SigningKey.Length < JwtOptions.MIN_SIGNING_KEY_LENGTH)
            failures.Add($"{nameof(options.SigningKey)} must be at least {JwtOptions.MIN_SIGNING_KEY_LENGTH} characters long.");

        return failures.Count > 0 ? ValidateOptionsResult.Fail(failures) : ValidateOptionsResult.Success;
    }
}
