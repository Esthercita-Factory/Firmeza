using Firmeza.Domain.Entities;

namespace Firmeza.Application.Interfaces;

public interface IEnterpriseRepository
{
    Task<IEnumerable<Enterprise>> GetAllAsync();
    Task<IEnumerable<Enterprise>> GetAllPagedAsync(int pageNumber, int pageSize);
    Task<Enterprise?> GetByIdAsync(Guid id);
    Task AddAsync(Enterprise enterprise);
    Task UpdateAsync(Enterprise enterprise);
    Task DeleteLogicalAsync(Guid id);
}
