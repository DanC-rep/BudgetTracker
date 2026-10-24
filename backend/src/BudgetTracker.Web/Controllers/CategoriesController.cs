using BudgetTracker.Application.Categories;
using BudgetTracker.Web.Extensions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BudgetTracker.Web.Controllers;

[ApiController]
[Route("api/categories")]
[Authorize]
public class CategoriesController : ControllerBase
{
    private readonly CreateCategory _createCategory;
    private readonly GetCategories _getCategories;
    private readonly UpdateCategory _updateCategory;
    private readonly HideCategory _hideCategory;
    private readonly ShowCategory _showCategory;
    private readonly DeleteCategory _deleteCategory;

    public CategoriesController(
        CreateCategory createCategory,
        GetCategories getCategories,
        UpdateCategory updateCategory,
        HideCategory hideCategory,
        ShowCategory showCategory,
        DeleteCategory deleteCategory)
    {
        _createCategory = createCategory;
        _getCategories = getCategories;
        _updateCategory = updateCategory;
        _hideCategory = hideCategory;
        _showCategory = showCategory;
        _deleteCategory = deleteCategory;
    }

    [HttpPost]
    public async Task<IActionResult> Create(
        [FromBody] CreateCategory.Request request,
        CancellationToken cancellationToken)
    {
        var result = await _createCategory.ExecuteAsync(request, cancellationToken);

        return result.ToActionResult(Ok);
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] bool includeHidden = false,
        CancellationToken cancellationToken = default)
    {
        var result = await _getCategories.ExecuteAsync(includeHidden, cancellationToken);

        return result.ToActionResult(Ok);
    }

    [HttpPatch("{categoryId:guid}")]
    public async Task<IActionResult> Update(
        Guid categoryId,
        [FromBody] UpdateCategory.Request request,
        CancellationToken cancellationToken)
    {
        var result = await _updateCategory.ExecuteAsync(
            request with { CategoryId = categoryId },
            cancellationToken);

        return result.ToActionResult(Ok);
    }

    [HttpPost("{categoryId:guid}/hide")]
    public async Task<IActionResult> Hide(
        Guid categoryId,
        CancellationToken cancellationToken)
    {
        var result = await _hideCategory.ExecuteAsync(
            new HideCategory.Request(categoryId),
            cancellationToken);

        return result.ToActionResult(Ok);
    }

    [HttpPost("{categoryId:guid}/show")]
    public async Task<IActionResult> Show(
        Guid categoryId,
        CancellationToken cancellationToken)
    {
        var result = await _showCategory.ExecuteAsync(
            new ShowCategory.Request(categoryId),
            cancellationToken);

        return result.ToActionResult(Ok);
    }

    [HttpDelete("{categoryId:guid}")]
    public async Task<IActionResult> Delete(
        Guid categoryId,
        CancellationToken cancellationToken)
    {
        var result = await _deleteCategory.ExecuteAsync(
            new DeleteCategory.Request(categoryId),
            cancellationToken);

        return result.ToActionResult(NoContent);
    }
}
