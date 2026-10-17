using BudgetTracker.Domain.Accounts;
using BudgetTracker.Domain.Categories;
using BudgetTracker.Domain.Transactions;
using BudgetTracker.Domain.Users;
using BudgetTracker.Domain.ValueObjects;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BudgetTracker.Infrastructure.Configurations;

public class TransactionConfiguration : IEntityTypeConfiguration<Transaction>
{
    public void Configure(EntityTypeBuilder<Transaction> builder)
    {
        builder.ToTable("transactions");

        builder.HasKey(t => t.Id);

        builder.Property(t => t.Type)
            .HasColumnName("type")
            .IsRequired();

        builder.ComplexProperty(t => t.Amount, mb =>
        {
            mb.Property(m => m.Amount)
                .HasColumnName("amount")
                .IsRequired()
                .HasPrecision(18, Money.MAX_PRECISION);

            mb.Property(m => m.Currency)
                .HasColumnName("currency")
                .IsRequired()
                .HasMaxLength(3);
        });

        builder.Property(t => t.Date)
            .HasColumnName("date")
            .IsRequired();

        builder.ComplexProperty(t => t.Description, db =>
        {
            db.Property(d => d.Value)
                .HasColumnName("description")
                .HasMaxLength(TransactionDescription.MAX_DESCRIPTION_LENGTH);
        });

        builder.Property(t => t.AccountId)
            .HasColumnName("account_id")
            .IsRequired();

        builder.Property(t => t.ToAccountId)
            .HasColumnName("to_account_id");

        builder.Property(t => t.CategoryId)
            .HasColumnName("category_id");

        builder.Property(t => t.UserId)
            .HasColumnName("user_id")
            .IsRequired();

        builder.HasOne<Account>()
            .WithMany()
            .HasForeignKey(t => t.AccountId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne<Account>()
            .WithMany()
            .HasForeignKey(t => t.ToAccountId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne<Category>()
            .WithMany()
            .HasForeignKey(t => t.CategoryId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne<User>()
            .WithMany()
            .HasForeignKey(t => t.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(t => new { t.UserId, t.Date });
        builder.HasIndex(t => t.AccountId);
        builder.HasIndex(t => t.ToAccountId);
        builder.HasIndex(t => t.CategoryId);
    }
}
