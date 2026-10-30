using BudgetTracker.Application.Accounts;
using BudgetTracker.Application.Categories;
using BudgetTracker.Application.Reports;
using BudgetTracker.Application.Transactions;
using BudgetTracker.Application.Users;
using Microsoft.Extensions.DependencyInjection;

namespace BudgetTracker.Application.DependencyInjection;

public static class ApplicationServiceCollectionExtensions
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddScoped<RegisterUser>();
        services.AddScoped<LoginUser>();
        services.AddScoped<GetCurrentUser>();

        services.AddScoped<CreateAccount>();
        services.AddScoped<RenameAccount>();
        services.AddScoped<ArchiveAccount>();
        services.AddScoped<UnarchiveAccount>();
        services.AddScoped<GetAccounts>();
        services.AddScoped<GetAccountDetails>();

        services.AddScoped<CreateCategory>();
        services.AddScoped<UpdateCategory>();
        services.AddScoped<HideCategory>();
        services.AddScoped<ShowCategory>();
        services.AddScoped<DeleteCategory>();
        services.AddScoped<GetCategories>();

        services.AddScoped<AddIncome>();
        services.AddScoped<AddExpense>();
        services.AddScoped<AddTransfer>();
        services.AddScoped<UpdateTransaction>();
        services.AddScoped<DeleteTransaction>();
        services.AddScoped<GetTransaction>();
        services.AddScoped<GetTransactions>();

        services.AddScoped<GetMonthlySummary>();
        services.AddScoped<GetBudgetStatus>();
        services.AddScoped<GetTotalBalance>();
        services.AddScoped<GetDashboard>();

        return services;
    }
}
