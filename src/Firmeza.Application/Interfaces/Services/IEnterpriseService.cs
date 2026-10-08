using Firmeza.Application.DTOs.Enterprises;

namespace Firmeza.Application.Interfaces.Services;

public interface IEnterpriseService
{
    Task<IEnumerable<EnterpriseDto>> GetAllAsync();
    Task<EnterpriseDto?> GetByIdAsync(Guid id);
    Task<EnterpriseDto> CreateAsync(EnterpriseDto enterpriseDto);
    Task<EnterpriseDto> UpdateAsync(Guid id, EnterpriseDto enterpriseDto);
    Task DeleteAsync(Guid id);
}
