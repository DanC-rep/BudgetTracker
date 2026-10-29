using BudgetTracker.Application.Users;
using BudgetTracker.Web.Extensions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BudgetTracker.Web.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly RegisterUser _registerUser;
    private readonly LoginUser _loginUser;
    private readonly GetCurrentUser _getCurrentUser;

    public AuthController(RegisterUser registerUser, LoginUser loginUser, GetCurrentUser getCurrentUser)
    {
        _registerUser = registerUser;
        _loginUser = loginUser;
        _getCurrentUser = getCurrentUser;
    }

    [AllowAnonymous]
    [HttpPost("register")]
    public async Task<IActionResult> Register(
        [FromBody] RegisterUser.Request request,
        CancellationToken cancellationToken)
    {
        var result = await _registerUser.ExecuteAsync(request, cancellationToken);

        return result.ToActionResult(Ok);
    }

    [AllowAnonymous]
    [HttpPost("login")]
    public async Task<IActionResult> Login(
        [FromBody] LoginUser.Request request,
        CancellationToken cancellationToken)
    {
        var result = await _loginUser.ExecuteAsync(request, cancellationToken);

        return result.ToActionResult(Ok);
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<IActionResult> Me(CancellationToken cancellationToken)
    {
        var result = await _getCurrentUser.ExecuteAsync(cancellationToken);

        return result.ToActionResult(Ok);
    }
}
