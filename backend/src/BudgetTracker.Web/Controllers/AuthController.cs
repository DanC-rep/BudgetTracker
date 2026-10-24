using BudgetTracker.Application.Users;
using BudgetTracker.Web.Extensions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BudgetTracker.Web.Controllers;

[ApiController]
[Route("api/auth")]
[AllowAnonymous]
public class AuthController : ControllerBase
{
    private readonly RegisterUser _registerUser;
    private readonly LoginUser _loginUser;

    public AuthController(RegisterUser registerUser, LoginUser loginUser)
    {
        _registerUser = registerUser;
        _loginUser = loginUser;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register(
        [FromBody] RegisterUser.Request request,
        CancellationToken cancellationToken)
    {
        var result = await _registerUser.ExecuteAsync(request, cancellationToken);

        return result.ToActionResult(Ok);
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(
        [FromBody] LoginUser.Request request,
        CancellationToken cancellationToken)
    {
        var result = await _loginUser.ExecuteAsync(request, cancellationToken);

        return result.ToActionResult(Ok);
    }
}
