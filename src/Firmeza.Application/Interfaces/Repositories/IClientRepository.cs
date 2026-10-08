using Firmeza.Domain.Entities;

namespace Firmeza.Application.Interfaces.Repositories;

public interface IClientRepository
{
    Task<IEnumerable<Client>> GetAllAsync();
    Task<IEnumerable<Client>> GetAllPagedAsync(int pageNumber, int pageSize);
    Task<Client?> GetByIdAsync(Guid id);
    Task AddAsync(Client client);
    Task UpdateAsync(Client client);
    Task DeleteLogicalAsync(Guid id);
}
