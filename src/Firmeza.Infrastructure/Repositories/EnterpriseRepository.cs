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
        return await _context.Enterprises.ToListAsync();
    }

    public async Task<IEnumerable<Enterprise>> GetAllPagedAsync(int pageNumber, int pageSize)
    {
        return await _context.Enterprises
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();
    }

    public async Task<Enterprise?> GetByIdAsync(Guid id)
    {
        return await _context.Enterprises.FindAsync(id);
    }

    public async Task AddAsync(Enterprise enterprise)
    {
        var existingEnterprise = await _context.Enterprises
            .FirstOrDefaultAsync(e => e.TaxId.Value == enterprise.TaxId.Value);

        if (existingEnterprise != null)
            throw new InvalidOperationException("Ya existe una empresa con este RUC/TaxId.");

        await _context.Enterprises.AddAsync(enterprise);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(Enterprise enterprise)
    {
        var existingEnterprise = await _context.Enterprises
            .FirstOrDefaultAsync(e => e.Id == enterprise.Id);

        if (existingEnterprise == null)
            throw new InvalidOperationException("Empresa no encontrada.");

        var duplicateTaxId = await _context.Enterprises
            .FirstOrDefaultAsync(e => e.TaxId.Value == enterprise.TaxId.Value && e.Id != enterprise.Id);

        if (duplicateTaxId != null)
            throw new InvalidOperationException("Ya existe otra empresa con este RUC/TaxId.");

        _context.Entry(existingEnterprise).CurrentValues.SetValues(enterprise);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteLogicalAsync(Guid id)
    {
        var enterprise = await _context.Enterprises.FindAsync(id);
        if (enterprise == null)
            throw new InvalidOperationException("Empresa no encontrada.");

        // Implementación de borrado lógico si se agrega propiedad IsDeleted
        // Por ahora, eliminación física
        _context.Enterprises.Remove(enterprise);
        await _context.SaveChangesAsync();
    }
}
