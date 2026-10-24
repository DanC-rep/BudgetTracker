using BudgetTracker.Application.Abstractions;
using BudgetTracker.Domain.Enums;
using BudgetTracker.Domain.ValueObjects;
using CSharpFunctionalExtensions;
using Shared.SharedKernel;

namespace BudgetTracker.Application.Transactions;

internal static class TransactionValidation
{
    // Checks shared by AddIncome/AddExpense and UpdateTransaction:
    // category exists (own or system), category type matches the operation, account exists.
    public static async Task<Result<(Money Money, TransactionDescription? Description), Error>> PrepareIncomeExpenseAsync(
        CategoryType requiredCategoryType,
        Guid userId,
        Guid accountId,
        Guid categoryId,
        decimal amount,
        string currency,
        string? description,
        ICategoriesRepository categoriesRepository,
        IAccountsRepository accountsRepository,
        CancellationToken cancellationToken)
    {
        var category = await categoriesRepository.GetByIdAsync(userId, categoryId, cancellationToken);
        if (category is null)
            return GeneralErrors.NotFound(categoryId, "категория");

        if (category.Type != requiredCategoryType)
            return Error.Validation("transaction.category.type.mismatch", "Тип категории не соответствует типу операции");

        var account = await accountsRepository.GetByIdAsync(userId, accountId, cancellationToken);
        if (account is null)
            return GeneralErrors.NotFound(accountId, "счёт");

        return PrepareMoneyAndDescription(amount, currency, description);
    }

    // Checks shared by AddTransfer and UpdateTransaction:
    // both accounts exist (owned by the user) and neither is archived.
    public static async Task<Result<(Money Money, TransactionDescription? Description), Error>> PrepareTransferAsync(
        Guid userId,
        Guid fromAccountId,
        Guid toAccountId,
        decimal amount,
        string currency,
        string? description,
        IAccountsRepository accountsRepository,
        CancellationToken cancellationToken)
    {
        var fromAccount = await accountsRepository.GetByIdAsync(userId, fromAccountId, cancellationToken);
        if (fromAccount is null)
            return GeneralErrors.NotFound(fromAccountId, "счёт");

        var toAccount = await accountsRepository.GetByIdAsync(userId, toAccountId, cancellationToken);
        if (toAccount is null)
            return GeneralErrors.NotFound(toAccountId, "счёт");

        if (fromAccount.IsArchived || toAccount.IsArchived)
            return Error.Validation("transaction.account.archived", "Нельзя проводить операции с архивным счётом");

        return PrepareMoneyAndDescription(amount, currency, description);
    }

    // Model binding yields DateTimeKind.Unspecified, which Npgsql rejects for timestamptz columns.
    public static DateTime NormalizeDate(DateTime date) =>
        date.Kind == DateTimeKind.Unspecified ? DateTime.SpecifyKind(date, DateTimeKind.Utc) : date.ToUniversalTime();

    private static Result<(Money Money, TransactionDescription? Description), Error> PrepareMoneyAndDescription(
        decimal amount,
        string currency,
        string? description)
    {
        var money = Money.Create(amount, currency);
        if (money.IsFailure)
            return money.Error;

        TransactionDescription? transactionDescription = null;
        if (!string.IsNullOrWhiteSpace(description))
        {
            var created = TransactionDescription.Create(description);
            if (created.IsFailure)
                return created.Error;

            transactionDescription = created.Value;
        }

        return (money.Value, transactionDescription);
    }
}
