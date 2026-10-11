using Firmeza.Application.Interfaces.Repositories;
using Firmeza.Domain.Entities;
using Firmeza.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Firmeza.Infrastructure.Repositories;

public class EnterpriseRepository : IEnterpriseRepository
{
    private readonly AppDbContext _context;

    public EnterpriseRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Enterprise>> GetAllAsync()
    {
        return await _context.Enterprises
            .OrderBy(e => e.Name)
            .ToListAsync();
    }

    public async Task<IEnumerable<Enterprise>> GetAllPagedAsync(int pageNumber, int pageSize)
    {
        return await _context.Enterprises
            .OrderBy(e => e.Name)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();
    }

    public async Task<(IEnumerable<Enterprise> Items, int TotalRecords)> GetPagedAsync(int pageNumber, int pageSize, bool? onlyActive = null)
    {
        var query = _context.Enterprises.AsQueryable();

        if (onlyActive.HasValue)
        {
            query = query.Where(e => e.IsActive == onlyActive.Value);
        }

        var totalRecords = await query.CountAsync();
        var items = await query
            .OrderBy(e => e.Name)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return (items, totalRecords);
    }

    public async Task<Enterprise?> GetByIdAsync(Guid id)
    {
        return await _context.Enterprises
            .FirstOrDefaultAsync(e => e.Id == id);
    }

    public async Task AddAsync(Enterprise enterprise)
    {
        await _context.Enterprises.AddAsync(enterprise);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(Enterprise enterprise)
    {
        _context.Enterprises.Update(enterprise);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteLogicalAsync(Guid id)
    {
        var enterprise = await _context.Enterprises.FirstOrDefaultAsync(e => e.Id == id);
        if (enterprise == null)
            throw new KeyNotFoundException($"Empresa con Id '{id}' no encontrada.");

        enterprise.Deactivate();
        await _context.SaveChangesAsync();
    }

    public async Task<bool> ExistsByTaxIdAsync(string taxId, Guid? excludeId = null)
    {
        var query = _context.Enterprises.Where(e => e.TaxId.Value == taxId);
        if (excludeId.HasValue)
        {
            query = query.Where(e => e.Id != excludeId.Value);
        }

        return await query.AnyAsync();
    }

    public async Task<bool> ExistsByEmailAsync(string email, Guid? excludeId = null)
    {
        var query = _context.Enterprises.Where(e => e.Email.Value == email);
        if (excludeId.HasValue)
        {
            query = query.Where(e => e.Id != excludeId.Value);
        }

        return await query.AnyAsync();
    }
}
