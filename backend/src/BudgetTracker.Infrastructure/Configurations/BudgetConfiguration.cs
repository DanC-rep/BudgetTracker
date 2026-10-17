using BudgetTracker.Domain.Budgets;
using BudgetTracker.Domain.ValueObjects;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BudgetTracker.Infrastructure.Configurations;

public class BudgetConfiguration : IEntityTypeConfiguration<Budget>
{
    public void Configure(EntityTypeBuilder<Budget> builder)
    {
        builder.ToTable("budgets");

        builder.HasKey(b => b.Id);

        builder.ComplexProperty(b => b.Limit, mb =>
        {
            mb.Property(m => m.Amount)
                .HasColumnName("limit_amount")
                .IsRequired()
                .HasPrecision(18, Money.MAX_PRECISION);

            mb.Property(m => m.Currency)
                .HasColumnName("limit_currency")
                .IsRequired()
                .HasMaxLength(3);
        });

        builder.ComplexProperty(b => b.Period, pb =>
        {
            pb.Property(p => p.Year)
                .HasColumnName("period_year")
                .IsRequired();

            pb.Property(p => p.Month)
                .HasColumnName("period_month")
                .IsRequired();
        });

        builder.Property(b => b.CategoryId)
            .HasColumnName("category_id");

        builder.Property(b => b.UserId)
            .HasColumnName("user_id")
            .IsRequired();

        builder.HasOne<BudgetTracker.Domain.Categories.Category>()
            .WithMany()
            .HasForeignKey(b => b.CategoryId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne<BudgetTracker.Domain.Users.User>()
            .WithMany()
            .HasForeignKey(b => b.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        // Unique index on (user_id, period, category_id) is created via raw SQL in the Initial migration:
        // EF Core 10 cannot target scalar members of complex properties in HasIndex (supported since EF Core 11).
    }
}
