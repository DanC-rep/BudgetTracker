using System.Security.Claims;
using BudgetTracker.Application.Abstractions;
using Microsoft.IdentityModel.JsonWebTokens;

namespace BudgetTracker.Web.Authentication;

public class CurrentUserAccessor : ICurrentUserAccessor
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CurrentUserAccessor(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public Guid UserId
    {
        get
        {
            var principal = _httpContextAccessor.HttpContext?.User
                ?? throw new InvalidOperationException("Current user is not authenticated.");

            var value = principal.FindFirstValue(JwtRegisteredClaimNames.Sub)
                ?? principal.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? throw new InvalidOperationException("Current user id claim is missing.");

            return Guid.Parse(value);
        }
    }
}
