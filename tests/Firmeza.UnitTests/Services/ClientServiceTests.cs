using Firmeza.Application.DTOs.Clients;
using Firmeza.Application.Exceptions;
using Firmeza.Application.Interfaces.Repositories;
using Firmeza.Application.Services;
using Firmeza.Domain.Entities;
using Firmeza.Domain.Enums;
using Moq;
using Xunit;

namespace Firmeza.UnitTests.Services;

public class ClientServiceTests
{
    private readonly Mock<IClientRepository> _mockClientRepo;
    private readonly Mock<IEnterpriseRepository> _mockEnterpriseRepo;
    private readonly ClientService _service;

    public ClientServiceTests()
    {
        _mockClientRepo = new Mock<IClientRepository>();
        _mockEnterpriseRepo = new Mock<IEnterpriseRepository>();
        _service = new ClientService(_mockClientRepo.Object, _mockEnterpriseRepo.Object);
    }

    [Fact]
    public async Task CreateAsync_WhenEmailAlreadyExists_ThrowsConflictException()
    {
        // Arrange
        var enterpriseId = Guid.NewGuid();
        var enterprise = new Enterprise("Empresa Test", "Test", EnterpriseType.Corporation, "Dir", "3001234567", "emp@test.com", "900123456-1");
        var dto = new CreateClientDto
        {
            Name = "Juan Perez",
            Age = 30,
            Phone = "3001234567",
            Email = "duplicate@test.com",
            Document = "12345678",
            EnterpriseId = enterpriseId
        };

        _mockEnterpriseRepo.Setup(r => r.GetByIdAsync(enterpriseId)).ReturnsAsync(enterprise);
        _mockClientRepo.Setup(r => r.ExistsByEmailAsync(dto.Email, null)).ReturnsAsync(true);

        // Act & Assert
        var ex = await Assert.ThrowsAsync<ConflictException>(() => _service.CreateAsync(dto));
        Assert.Contains(dto.Email, ex.Message);
    }

    [Fact]
    public async Task CreateAsync_WhenDocumentAlreadyExists_ThrowsConflictException()
    {
        // Arrange
        var enterpriseId = Guid.NewGuid();
        var enterprise = new Enterprise("Empresa Test", "Test", EnterpriseType.Corporation, "Dir", "3001234567", "emp@test.com", "900123456-1");
        var dto = new CreateClientDto
        {
            Name = "Juan Perez",
            Age = 30,
            Phone = "3001234567",
            Email = "unique@test.com",
            Document = "12345678",
            EnterpriseId = enterpriseId
        };

        _mockEnterpriseRepo.Setup(r => r.GetByIdAsync(enterpriseId)).ReturnsAsync(enterprise);
        _mockClientRepo.Setup(r => r.ExistsByEmailAsync(dto.Email, null)).ReturnsAsync(false);
        _mockClientRepo.Setup(r => r.ExistsByDocumentAsync(dto.Document, null)).ReturnsAsync(true);

        // Act & Assert
        var ex = await Assert.ThrowsAsync<ConflictException>(() => _service.CreateAsync(dto));
        Assert.Contains(dto.Document, ex.Message);
    }

    [Fact]
    public async Task CreateAsync_WhenEnterpriseNotFound_ThrowsNotFoundException()
    {
        // Arrange
        var enterpriseId = Guid.NewGuid();
        var dto = new CreateClientDto
        {
            Name = "Juan Perez",
            Age = 30,
            Phone = "3001234567",
            Email = "juan@test.com",
            Document = "12345678",
            EnterpriseId = enterpriseId
        };

        _mockEnterpriseRepo.Setup(r => r.GetByIdAsync(enterpriseId)).ReturnsAsync((Enterprise?)null);

        // Act & Assert
        await Assert.ThrowsAsync<NotFoundException>(() => _service.CreateAsync(dto));
    }

    [Fact]
    public async Task CreateAsync_WithValidData_ReturnsCreatedClientResponseDto()
    {
        // Arrange
        var enterpriseId = Guid.NewGuid();
        var enterprise = new Enterprise("Empresa Test", "Test", EnterpriseType.Corporation, "Dir", "3001234567", "emp@test.com", "900123456-1");
        var dto = new CreateClientDto
        {
            Name = "Juan Perez",
            Age = 30,
            Phone = "3001234567",
            Email = "juan@test.com",
            Document = "12345678",
            EnterpriseId = enterpriseId
        };

        _mockEnterpriseRepo.Setup(r => r.GetByIdAsync(enterpriseId)).ReturnsAsync(enterprise);
        _mockClientRepo.Setup(r => r.ExistsByEmailAsync(dto.Email, null)).ReturnsAsync(false);
        _mockClientRepo.Setup(r => r.ExistsByDocumentAsync(dto.Document, null)).ReturnsAsync(false);
        _mockClientRepo.Setup(r => r.AddAsync(It.IsAny<Client>())).Returns(Task.CompletedTask);

        // Act
        var result = await _service.CreateAsync(dto);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(dto.Name, result.Name);
        Assert.Equal(dto.Document, result.Document);
        Assert.Equal(dto.Email, result.Email);
        Assert.True(result.IsActive);
        _mockClientRepo.Verify(r => r.AddAsync(It.IsAny<Client>()), Times.Once);
    }

    [Fact]
    public async Task UpdateAsync_WhenDocumentCollidesWithAnotherClient_ThrowsConflictException()
    {
        // Arrange
        var id = Guid.NewGuid();
        var enterpriseId = Guid.NewGuid();
        var existingClient = new Client("Carlos Ruiz", 28, "3009876543", "carlos@test.com", "11122233", enterpriseId);
        var dto = new UpdateClientDto
        {
            Name = "Carlos Updated",
            Age = 29,
            Phone = "3009876543",
            Email = "carlos@test.com",
            Document = "99988877",
            EnterpriseId = enterpriseId
        };

        _mockClientRepo.Setup(r => r.GetByIdAsync(id)).ReturnsAsync(existingClient);
        _mockEnterpriseRepo.Setup(r => r.GetByIdAsync(enterpriseId))
            .ReturnsAsync(new Enterprise("Empresa", "Emp", EnterpriseType.Corporation, "Dir", "3001234567", "emp@test.com", "900123456-1"));
        _mockClientRepo.Setup(r => r.ExistsByEmailAsync(dto.Email, id)).ReturnsAsync(false);
        _mockClientRepo.Setup(r => r.ExistsByDocumentAsync(dto.Document, id)).ReturnsAsync(true);

        // Act & Assert
        var ex = await Assert.ThrowsAsync<ConflictException>(() => _service.UpdateAsync(id, dto));
        Assert.Contains(dto.Document, ex.Message);
    }

    [Fact]
    public async Task DeleteLogicalAsync_WhenActive_DeactivatesClient()
    {
        // Arrange
        var id = Guid.NewGuid();
        var enterpriseId = Guid.NewGuid();
        var existingClient = new Client("Carlos Ruiz", 28, "3009876543", "carlos@test.com", "11122233", enterpriseId);

        _mockClientRepo.Setup(r => r.GetByIdAsync(id)).ReturnsAsync(existingClient);
        _mockClientRepo.Setup(r => r.DeleteLogicalAsync(id)).Returns(Task.CompletedTask);

        // Act
        await _service.DeleteLogicalAsync(id);

        // Assert
        _mockClientRepo.Verify(r => r.DeleteLogicalAsync(id), Times.Once);
    }
}
