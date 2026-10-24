using CSharpFunctionalExtensions;
using Microsoft.AspNetCore.Mvc;
using Shared.SharedKernel;

namespace BudgetTracker.Web.Extensions;

public static class ResultExtensions
{
    public static IActionResult ToActionResult<TValue>(
        this Result<TValue, Error> result,
        Func<TValue, IActionResult> onSuccess)
    {
        return result.IsSuccess ? onSuccess(result.Value) : result.Error.ToActionResult();
    }

    public static IActionResult ToActionResult(
        this UnitResult<Error> result,
        Func<IActionResult> onSuccess)
    {
        return result.IsSuccess ? onSuccess() : result.Error.ToActionResult();
    }

    public static IActionResult ToActionResult(this Error error)
    {
        var (statusCode, title) = error.Type switch
        {
            ErrorType.Validation => (StatusCodes.Status400BadRequest, "Validation error"),
            ErrorType.NotFound => (StatusCodes.Status404NotFound, "Not found"),
            ErrorType.Conflict => (StatusCodes.Status409Conflict, "Conflict"),
            ErrorType.Authentication => (StatusCodes.Status401Unauthorized, "Authentication error"),
            ErrorType.Authorization => (StatusCodes.Status403Forbidden, "Authorization error"),
            _ => (StatusCodes.Status500InternalServerError, "Internal server error"),
        };

        var problemDetails = new ProblemDetails
        {
            Status = statusCode,
            Title = title,
            Detail = error.Messages.FirstOrDefault()?.Message,
            Extensions =
            {
                ["errors"] = error.Messages
                    .Select(m => new { m.Code, m.Message, m.InvalidField })
                    .ToArray(),
            },
        };

        return new ObjectResult(problemDetails) { StatusCode = statusCode };
    }
}
