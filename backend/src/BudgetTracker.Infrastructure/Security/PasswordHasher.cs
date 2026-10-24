using System.Security.Cryptography;
using BudgetTracker.Application.Abstractions;

namespace BudgetTracker.Infrastructure.Security;

public class PasswordHasher : IPasswordHasher
{
    private const int SaltSize = 16;

    private const int KeySize = 32;

    private const int Iterations = 100_000;

    private static readonly HashAlgorithmName Algorithm = HashAlgorithmName.SHA256;

    private const char SegmentSeparator = '.';

    public string Hash(string password)
    {
        var salt = RandomNumberGenerator.GetBytes(SaltSize);
        var key = Rfc2898DeriveBytes.Pbkdf2(password, salt, Iterations, Algorithm, KeySize);

        return string.Join(
            SegmentSeparator,
            Iterations,
            Convert.ToBase64String(salt),
            Convert.ToBase64String(key));
    }

    public bool Verify(string password, string hash)
    {
        var segments = hash.Split(SegmentSeparator, StringSplitOptions.RemoveEmptyEntries);
        if (segments.Length != 3
            || !int.TryParse(segments[0], out var iterations))
        {
            return false;
        }

        var salt = Convert.FromBase64String(segments[1]);
        var expectedKey = Convert.FromBase64String(segments[2]);

        var actualKey = Rfc2898DeriveBytes.Pbkdf2(password, salt, iterations, Algorithm, expectedKey.Length);

        return CryptographicOperations.FixedTimeEquals(actualKey, expectedKey);
    }
}
