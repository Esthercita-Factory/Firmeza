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
            .OrderBy(c => c.Name)
            .ToListAsync();
    }

    public async Task<IEnumerable<Client>> GetAllPagedAsync(int pageNumber, int pageSize)
    {
        return await _context.Clients
            .OrderBy(c => c.Name)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();
    }

    public async Task<(IEnumerable<Client> Items, int TotalRecords)> GetPagedAsync(int pageNumber, int pageSize, bool? onlyActive = null)
    {
        var query = _context.Clients.AsQueryable();

        if (onlyActive.HasValue)
        {
            query = query.Where(c => c.IsActive == onlyActive.Value);
        }

        var totalRecords = await query.CountAsync();
        var items = await query
            .OrderBy(c => c.Name)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return (items, totalRecords);
    }

    public async Task<Client?> GetByIdAsync(Guid id)
    {
        return await _context.Clients
            .FirstOrDefaultAsync(c => c.Id == id);
    }

    public async Task AddAsync(Client client)
    {
        await _context.Clients.AddAsync(client);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(Client client)
    {
        _context.Clients.Update(client);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteLogicalAsync(Guid id)
    {
        var client = await _context.Clients.FirstOrDefaultAsync(c => c.Id == id);
        if (client == null)
            throw new KeyNotFoundException($"Cliente con Id '{id}' no encontrado.");

        client.Deactivate();
        await _context.SaveChangesAsync();
    }

    public async Task<bool> ExistsByEmailAsync(string email, Guid? excludeId = null)
    {
        var query = _context.Clients.Where(c => c.Email == email);
        if (excludeId.HasValue)
        {
            query = query.Where(c => c.Id != excludeId.Value);
        }

        return await query.AnyAsync();
    }

    public async Task<bool> ExistsByDocumentAsync(string document, Guid? excludeId = null)
    {
        var query = _context.Clients.Where(c => c.Document == document);
        if (excludeId.HasValue)
        {
            query = query.Where(c => c.Id != excludeId.Value);
        }

        return await query.AnyAsync();
    }
}
