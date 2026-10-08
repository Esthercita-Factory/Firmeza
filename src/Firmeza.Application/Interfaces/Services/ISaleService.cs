using Firmeza.Application.DTOs.Sales;

namespace Firmeza.Application.Interfaces.Services;

public interface ISaleService
{
    Task<IEnumerable<SaleDto>> GetAllAsync();
    Task<SaleDto?> GetByIdAsync(Guid id);
    Task<SaleDto> CreateAsync(SaleDto saleDto);
    Task<SaleDto> UpdateAsync(Guid id, SaleDto saleDto);
    Task DeleteAsync(Guid id);
}
