using BudgetTracker.Domain.Users;
using BudgetTracker.Domain.ValueObjects;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BudgetTracker.Infrastructure.Configurations;

public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.ToTable("users");

        builder.HasKey(u => u.Id);

        builder.ComplexProperty(u => u.Login, lb =>
        {
            lb.Property(l => l.Value)
                .HasColumnName("login")
                .IsRequired()
                .HasMaxLength(Login.MAX_LOGIN_LENGTH);
        });

        builder.ComplexProperty(u => u.Email, eb =>
        {
            eb.Property(e => e.Value)
                .HasColumnName("email")
                .IsRequired()
                .HasMaxLength(Email.MAX_EMAIL_LENGTH);
        });

        builder.Property(u => u.PasswordHash)
            .HasColumnName("password_hash")
            .IsRequired();

        builder.Property(u => u.Name)
            .HasColumnName("name")
            .IsRequired()
            .HasMaxLength(User.MAX_NAME_LENGTH);

        builder.Property(u => u.AvatarColor)
            .HasColumnName("avatar_color")
            .IsRequired()
            .HasMaxLength(User.MAX_AVATAR_COLOR_LENGTH);

        builder.Property(u => u.CreatedAt)
            .HasColumnName("created_at")
            .IsRequired();

        // Unique indexes on login and email are created via raw SQL in the Initial migration:
        // EF Core 10 cannot target scalar members of complex properties in HasIndex (supported since EF Core 11).
    }
}
