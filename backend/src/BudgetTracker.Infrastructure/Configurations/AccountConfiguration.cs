using BudgetTracker.Domain.Accounts;
using BudgetTracker.Domain.Users;
using BudgetTracker.Domain.ValueObjects;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BudgetTracker.Infrastructure.Configurations;

public class AccountConfiguration : IEntityTypeConfiguration<Account>
{
    public void Configure(EntityTypeBuilder<Account> builder)
    {
        builder.ToTable("accounts");

        builder.HasKey(a => a.Id);

        builder.ComplexProperty(a => a.Name, nb =>
        {
            nb.Property(n => n.Value)
                .HasColumnName("name")
                .IsRequired()
                .HasMaxLength(AccountName.MAX_NAME_LENGTH);
        });

        builder.Property(a => a.Type)
            .HasColumnName("type")
            .IsRequired();

        builder.ComplexProperty(a => a.InitialBalance, mb =>
        {
            mb.Property(m => m.Amount)
                .HasColumnName("initial_balance")
                .IsRequired()
                .HasPrecision(18, Money.MAX_PRECISION);

            mb.Property(m => m.Currency)
                .HasColumnName("currency")
                .IsRequired()
                .HasMaxLength(3);
        });

        builder.Property(a => a.IsArchived)
            .HasColumnName("is_archived")
            .IsRequired();

        builder.Property(a => a.OwnerId)
            .HasColumnName("owner_id")
            .IsRequired();

        builder.HasOne<User>()
            .WithMany()
            .HasForeignKey(a => a.OwnerId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(a => a.OwnerId);

        // Unique index on (owner_id, name) is created via raw SQL in the Initial migration:
        // EF Core 10 cannot target scalar members of complex properties in HasIndex (supported since EF Core 11).
    }
}
