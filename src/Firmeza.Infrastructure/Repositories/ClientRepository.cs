using Firmeza.Application.Interfaces.Repositories;
using Firmeza.Domain.Entities;
using Firmeza.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Firmeza.Infrastructure.Repositories;

public class ClientRepository : IClientRepository
{
    private readonly AppDbContext _context;

    public ClientRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Client>> GetAllAsync()
    {
        return await _context.Clients
            .Include(c => c.Enterprise)
            .ToListAsync();
    }

    public async Task<IEnumerable<Client>> GetAllPagedAsync(int pageNumber, int pageSize)
    {
        return await _context.Clients
            .Include(c => c.Enterprise)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();
    }

    public async Task<Client?> GetByIdAsync(Guid id)
    {
        return await _context.Clients
            .Include(c => c.Enterprise)
            .FirstOrDefaultAsync(c => c.Id == id);
    }

    public async Task AddAsync(Client client)
    {
        var existingClient = await _context.Clients
            .FirstOrDefaultAsync(c => c.Document.Value == client.Document.Value);

        if (existingClient != null)
            throw new InvalidOperationException("Ya existe un cliente con este documento.");

        await _context.Clients.AddAsync(client);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(Client client)
    {
        var existingClient = await _context.Clients
            .FirstOrDefaultAsync(c => c.Id == client.Id);

        if (existingClient == null)
            throw new InvalidOperationException("Cliente no encontrado.");

        var duplicateDocument = await _context.Clients
            .FirstOrDefaultAsync(c => c.Document.Value == client.Document.Value && c.Id != client.Id);

        if (duplicateDocument != null)
            throw new InvalidOperationException("Ya existe otro cliente con este documento.");

        _context.Entry(existingClient).CurrentValues.SetValues(client);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteLogicalAsync(Guid id)
    {
        var client = await _context.Clients.FindAsync(id);
        if (client == null)
            throw new InvalidOperationException("Cliente no encontrado.");

        // Implementación de borrado lógico si se agrega propiedad IsDeleted
        // Por ahora, eliminación física
        _context.Clients.Remove(client);
        await _context.SaveChangesAsync();
    }
}
