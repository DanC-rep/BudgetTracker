using BudgetTracker.Domain.Categories;
using BudgetTracker.Domain.Users;
using BudgetTracker.Domain.ValueObjects;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BudgetTracker.Infrastructure.Configurations;

public class CategoryConfiguration : IEntityTypeConfiguration<Category>
{
    public void Configure(EntityTypeBuilder<Category> builder)
    {
        builder.ToTable("categories");

        builder.HasKey(c => c.Id);

        builder.ComplexProperty(c => c.Name, nb =>
        {
            nb.Property(n => n.Value)
                .HasColumnName("name")
                .IsRequired()
                .HasMaxLength(CategoryName.MAX_NAME_LENGTH);
        });

        builder.Property(c => c.Type)
            .HasColumnName("type")
            .IsRequired();

        builder.Property(c => c.UserId)
            .HasColumnName("user_id");

        builder.HasOne<User>()
            .WithMany()
            .HasForeignKey(c => c.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        // Unique index on (user_id, name) is created via raw SQL in the Initial migration:
        // EF Core 10 cannot target scalar members of complex properties in HasIndex (supported since EF Core 11).
    }
}
