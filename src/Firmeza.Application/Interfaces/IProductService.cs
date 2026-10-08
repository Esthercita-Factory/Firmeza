using Firmeza.Application.DTOs.Products;

namespace Firmeza.Application.Interfaces;

public interface IProductService
{
    Task<IEnumerable<ProductDto>> GetAllAsync();
    Task<ProductDto?> GetByIdAsync(Guid id);
    Task<ProductDto> CreateAsync(ProductDto productDto);
    Task<ProductDto> UpdateAsync(Guid id, ProductDto productDto);
    Task DeleteAsync(Guid id);
}
