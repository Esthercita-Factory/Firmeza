using Firmeza.Domain.Entities;
using Firmeza.Domain.ValueObjects;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Firmeza.Infrastructure.Configurations;

public class CustomerConfiguration : IEntityTypeConfiguration<Client>
{
    public void Configure(EntityTypeBuilder<Client> builder)
    {
        builder.HasKey(c => c.Id);

        builder.Property(c => c.IsActive)
            .IsRequired()
            .HasDefaultValue(true);

        builder.Property(c => c.Name)
            .IsRequired()
            .HasMaxLength(150);

        builder.Property(c => c.Age)
            .IsRequired();

        builder.Property(c => c.Phone)
            .HasConversion(
                phone => phone.Value,
                value => PhoneNumber.Create(value))
            .IsRequired()
            .HasMaxLength(20);

        builder.Property(c => c.Email)
            .HasConversion(
                email => email.Value,
                value => Email.Create(value))
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(c => c.Document)
            .HasConversion(
                doc => doc.Value,
                value => DocumentNumber.Create(value))
            .IsRequired()
            .HasMaxLength(20);

        builder.HasOne(c => c.Enterprise)
            .WithMany()
            .HasForeignKey(c => c.EnterpriseId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasIndex(c => c.Document)
            .IsUnique()
            .HasDatabaseName("IX_Clients_Document");

        builder.HasIndex(c => c.Email)
            .HasDatabaseName("IX_Clients_Email");
    }
}