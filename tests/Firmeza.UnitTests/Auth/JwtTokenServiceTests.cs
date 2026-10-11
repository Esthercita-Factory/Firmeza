using System.IdentityModel.Tokens.Jwt;
using Firmeza.Api.Services;
using Microsoft.Extensions.Configuration;
using Xunit;

namespace Firmeza.UnitTests.Auth;

public class JwtTokenServiceTests
{
    [Fact]
    public void GenerateToken_ReturnsValidJwtStringWithCorrectClaims()
    {
        // Arrange
        var inMemorySettings = new Dictionary<string, string?>
        {
            { "Jwt:Key", "SuperSecretKeyForFirmezaJwtAuthentication2026!#" },
            { "Jwt:Issuer", "Firmeza.Api" },
            { "Jwt:Audience", "Firmeza.Clients" },
            { "Jwt:ExpireMinutes", "60" }
        };

        var configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(inMemorySettings)
            .Build();

        var tokenService = new JwtTokenService(configuration);

        // Act
        var token = tokenService.GenerateToken("admin@firmeza.com", "Administrator");

        // Assert
        Assert.NotNull(token);
        Assert.NotEmpty(token);

        var handler = new JwtSecurityTokenHandler();
        Assert.True(handler.CanReadToken(token));

        var jwt = handler.ReadJwtToken(token);
        Assert.Equal("Firmeza.Api", jwt.Issuer);
        Assert.Contains("Firmeza.Clients", jwt.Audiences);
        Assert.Equal("admin@firmeza.com", jwt.Subject);
    }
}
