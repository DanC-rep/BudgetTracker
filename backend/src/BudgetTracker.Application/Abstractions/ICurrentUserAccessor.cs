namespace BudgetTracker.Application.Abstractions;

public interface ICurrentUserAccessor
{
    Guid UserId { get; }
}
