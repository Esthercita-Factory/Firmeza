using Firmeza.Application.DTOs.Enterprises;
using Firmeza.Application.Exceptions;
using Firmeza.Application.Interfaces.Repositories;
using Firmeza.Application.Services;
using Firmeza.Domain.Entities;
using Firmeza.Domain.Enums;
using Moq;
using Xunit;

namespace Firmeza.UnitTests.Services;

public class EnterpriseServiceTests
{
    private readonly Mock<IEnterpriseRepository> _mockRepo;
    private readonly EnterpriseService _service;

    public EnterpriseServiceTests()
    {
        _mockRepo = new Mock<IEnterpriseRepository>();
        _service = new EnterpriseService(_mockRepo.Object);
    }

    [Fact]
    public async Task CreateAsync_WhenTaxIdAlreadyExists_ThrowsConflictException()
    {
        // Arrange
        var dto = new CreateEnterpriseDto
        {
            Name = "Acme Corp",
            TradeName = "Acme",
            Type = 2,
            Address = "Calle 100 # 15-20",
            Phone = "+57 300 123 4567",
            Email = "contact@acme.com",
            TaxId = "900123456-7"
        };

        _mockRepo.Setup(r => r.ExistsByTaxIdAsync(dto.TaxId, null))
            .ReturnsAsync(true);

        // Act & Assert
        var ex = await Assert.ThrowsAsync<ConflictException>(() => _service.CreateAsync(dto));
        Assert.Contains(dto.TaxId, ex.Message);
    }

    [Fact]
    public async Task CreateAsync_WhenEmailAlreadyExists_ThrowsConflictException()
    {
        // Arrange
        var dto = new CreateEnterpriseDto
        {
            Name = "Acme Corp",
            TradeName = "Acme",
            Type = 2,
            Address = "Calle 100 # 15-20",
            Phone = "+57 300 123 4567",
            Email = "duplicate@acme.com",
            TaxId = "900123456-7"
        };

        _mockRepo.Setup(r => r.ExistsByTaxIdAsync(dto.TaxId, null))
            .ReturnsAsync(false);
        _mockRepo.Setup(r => r.ExistsByEmailAsync(dto.Email, null))
            .ReturnsAsync(true);

        // Act & Assert
        var ex = await Assert.ThrowsAsync<ConflictException>(() => _service.CreateAsync(dto));
        Assert.Contains(dto.Email, ex.Message);
    }

    [Fact]
    public async Task CreateAsync_WithValidData_ReturnsCreatedResponseDto()
    {
        // Arrange
        var dto = new CreateEnterpriseDto
        {
            Name = "Acme Corp",
            TradeName = "Acme",
            Type = 2,
            Address = "Calle 100 # 15-20",
            Phone = "+57 300 123 4567",
            Email = "contact@acme.com",
            TaxId = "900123456-7"
        };

        _mockRepo.Setup(r => r.ExistsByTaxIdAsync(dto.TaxId, null)).ReturnsAsync(false);
        _mockRepo.Setup(r => r.ExistsByEmailAsync(dto.Email, null)).ReturnsAsync(false);
        _mockRepo.Setup(r => r.AddAsync(It.IsAny<Enterprise>())).Returns(Task.CompletedTask);

        // Act
        var result = await _service.CreateAsync(dto);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(dto.Name, result.Name);
        Assert.Equal(dto.TaxId, result.TaxId);
        Assert.True(result.IsActive);
        _mockRepo.Verify(r => r.AddAsync(It.IsAny<Enterprise>()), Times.Once);
    }

    [Fact]
    public async Task UpdateAsync_WhenEnterpriseNotFound_ThrowsNotFoundException()
    {
        // Arrange
        var id = Guid.NewGuid();
        var dto = new UpdateEnterpriseDto
        {
            Name = "Acme Updated",
            TradeName = "Acme",
            Type = 2,
            Address = "Calle 100 # 15-20",
            Phone = "+57 300 123 4567",
            Email = "contact@acme.com",
            TaxId = "900123456-7"
        };

        _mockRepo.Setup(r => r.GetByIdAsync(id)).ReturnsAsync((Enterprise?)null);

        // Act & Assert
        await Assert.ThrowsAsync<NotFoundException>(() => _service.UpdateAsync(id, dto));
    }

    [Fact]
    public async Task UpdateAsync_WhenTaxIdCollidesWithAnotherEnterprise_ThrowsConflictException()
    {
        // Arrange
        var id = Guid.NewGuid();
        var existing = new Enterprise("Acme Old", "Acme", EnterpriseType.Corporation, "Dir 1", "3001234567", "old@acme.com", "900111222-1");
        var dto = new UpdateEnterpriseDto
        {
            Name = "Acme New",
            TradeName = "Acme",
            Type = 2,
            Address = "Dir 2",
            Phone = "3001234567",
            Email = "new@acme.com",
            TaxId = "900999888-9"
        };

        _mockRepo.Setup(r => r.GetByIdAsync(id)).ReturnsAsync(existing);
        _mockRepo.Setup(r => r.ExistsByTaxIdAsync(dto.TaxId, id)).ReturnsAsync(true);

        // Act & Assert
        var ex = await Assert.ThrowsAsync<ConflictException>(() => _service.UpdateAsync(id, dto));
        Assert.Contains(dto.TaxId, ex.Message);
    }

    [Fact]
    public async Task DeleteLogicalAsync_WhenActive_DeactivatesEnterprise()
    {
        // Arrange
        var id = Guid.NewGuid();
        var existing = new Enterprise("Acme", "Acme", EnterpriseType.Corporation, "Dir 1", "3001234567", "acme@acme.com", "900111222-1");

        _mockRepo.Setup(r => r.GetByIdAsync(id)).ReturnsAsync(existing);
        _mockRepo.Setup(r => r.DeleteLogicalAsync(id)).Returns(Task.CompletedTask);

        // Act
        await _service.DeleteLogicalAsync(id);

        // Assert
        _mockRepo.Verify(r => r.DeleteLogicalAsync(id), Times.Once);
    }
}
