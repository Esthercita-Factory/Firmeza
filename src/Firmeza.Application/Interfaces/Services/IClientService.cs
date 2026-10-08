using Firmeza.Application.DTOs.Clients;

namespace Firmeza.Application.Interfaces.Services;

public interface IClientService
{
    Task<IEnumerable<ClientDto>> GetAllAsync();
    Task<ClientDto?> GetByIdAsync(Guid id);
    Task<ClientDto> CreateAsync(ClientDto clientDto);
    Task<ClientDto> UpdateAsync(Guid id, ClientDto clientDto);
    Task DeleteAsync(Guid id);
}
