using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace BudgetTracker.Infrastructure.DbContexts;

public class BudgetTrackerDbContextFactory : IDesignTimeDbContextFactory<BudgetTrackerDbContext>
{
    public BudgetTrackerDbContext CreateDbContext(string[] args)
    {
        var connectionString = Environment.GetEnvironmentVariable("BudgetTracker_DbConnectionString")
            ?? "Server=localhost;Port=5432;Database=budget_tracker;User Id=postgres;Password=postgres";

        var optionsBuilder = new DbContextOptionsBuilder<BudgetTrackerDbContext>();
        optionsBuilder.UseNpgsql(connectionString);
        optionsBuilder.UseSnakeCaseNamingConvention();

        return new BudgetTrackerDbContext(optionsBuilder.Options);
    }
}
