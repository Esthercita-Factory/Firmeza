using Firmeza.Domain.Common;
using Firmeza.Domain.Entities;
using Firmeza.Domain.Enums;
using Firmeza.Domain.ValueObjects;
using Xunit;

namespace Firmeza.UnitTests.Domain;

public class DomainEntitiesTests
{
    [Fact]
    public void Client_InheritsFromEntity_AndCanDeactivateAndActivate()
    {
        var enterpriseId = Guid.NewGuid();
        var client = new Client("Ana Gomez", 25, "3001234567", "ana@example.com", "12345678", enterpriseId);

        Assert.IsAssignableFrom<Entity>(client);
        Assert.NotEqual(Guid.Empty, client.Id);
        Assert.True(client.IsActive);

        client.Deactivate();
        Assert.False(client.IsActive);

        client.Activate();
        Assert.True(client.IsActive);
    }

    [Fact]
    public void Client_Update_UpdatesValuesCorrectly()
    {
        var enterpriseId = Guid.NewGuid();
        var client = new Client("Ana Gomez", 25, "3001234567", "ana@example.com", "12345678", enterpriseId);

        var newEnterpriseId = Guid.NewGuid();
        client.Update("Ana Maria Gomez", 26, "3109876543", "anamaria@example.com", "87654321", newEnterpriseId);

        Assert.Equal("Ana Maria Gomez", client.Name);
        Assert.Equal(26, client.Age);
        Assert.Equal("3109876543", client.Phone);
        Assert.Equal("anamaria@example.com", client.Email);
        Assert.Equal("87654321", client.Document);
        Assert.Equal(newEnterpriseId, client.EnterpriseId);
    }

    [Fact]
    public void Enterprise_Update_UpdatesValuesCorrectly()
    {
        var enterprise = new Enterprise("Empresa Uno", "Emp Uno", EnterpriseType.Corporation, "Dir 1", "3001234567", "uno@emp.com", "900111222-1");

        enterprise.Update("Empresa Dos", "Emp Dos", EnterpriseType.LimitedLiabilityCompany, "Dir 2", "3119876543", "dos@emp.com", "900333444-2");

        Assert.Equal("Empresa Dos", enterprise.Name);
        Assert.Equal("Emp Dos", enterprise.TradeName);
        Assert.Equal(EnterpriseType.LimitedLiabilityCompany, enterprise.Type);
        Assert.Equal("Dir 2", enterprise.Address);
        Assert.Equal("3119876543", enterprise.Phone.Value);
        Assert.Equal("dos@emp.com", enterprise.Email.Value);
        Assert.Equal("900333444-2", enterprise.TaxId.Value);
    }

    [Theory]
    [InlineData("123")] // Too short (< 7)
    [InlineData("")]    // Empty
    public void PhoneNumber_ThrowsArgumentException_WhenInvalid(string invalidPhone)
    {
        Assert.Throws<ArgumentException>(() => PhoneNumber.Create(invalidPhone));
    }

    [Fact]
    public void PhoneNumber_AcceptsUpTo50Characters()
    {
        var validLongPhone = "+57 (601) 234-5678 ext 1024 / cel 3001234567";
        var phone = PhoneNumber.Create(validLongPhone);
        Assert.Equal(validLongPhone, phone.Value);
    }

    [Theory]
    [InlineData("notanemail")]
    [InlineData("missingdot@com")]
    [InlineData("")]
    public void Email_ThrowsArgumentException_WhenInvalid(string invalidEmail)
    {
        Assert.Throws<ArgumentException>(() => Email.Create(invalidEmail));
    }
}
