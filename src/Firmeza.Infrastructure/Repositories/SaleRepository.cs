using Firmeza.Application.Interfaces.Repositories;
using Firmeza.Domain.Entities;
using Firmeza.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Firmeza.Infrastructure.Repositories;

public class SaleRepository : ISaleRepository
{
    private readonly AppDbContext _context;

    public SaleRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Sale>> GetAllAsync()
    {
        return await _context.Sales
            .Include(s => s.Client)
            .Include(s => s.SaleDetails)
            .ToListAsync();
    }

    public async Task<IEnumerable<Sale>> GetAllPagedAsync(int pageNumber, int pageSize)
    {
        return await _context.Sales
            .Include(s => s.Client)
            .Include(s => s.SaleDetails)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();
    }

    public async Task<Sale?> GetByIdAsync(Guid id)
    {
        return await _context.Sales
            .Include(s => s.Client)
            .Include(s => s.SaleDetails)
            .ThenInclude(sd => sd.Product)
            .FirstOrDefaultAsync(s => s.Id == id);
    }

    public async Task AddAsync(Sale sale)
    {
        var clientExists = await _context.Clients
            .AnyAsync(c => c.Id == sale.ClientId);

        if (!clientExists)
            throw new InvalidOperationException("El cliente especificado no existe.");

        await _context.Sales.AddAsync(sale);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(Sale sale)
    {
        var existingSale = await _context.Sales
            .FirstOrDefaultAsync(s => s.Id == sale.Id);

        if (existingSale == null)
            throw new InvalidOperationException("Venta no encontrada.");

        var clientExists = await _context.Clients
            .AnyAsync(c => c.Id == sale.ClientId);

        if (!clientExists)
            throw new InvalidOperationException("El cliente especificado no existe.");

        _context.Entry(existingSale).CurrentValues.SetValues(sale);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteLogicalAsync(Guid id)
    {
        var sale = await _context.Sales.FindAsync(id);
        if (sale == null)
            throw new InvalidOperationException("Venta no encontrada.");

        // Implementación de borrado lógico si se agrega propiedad IsDeleted
        // Por ahora, eliminación física (cascade eliminará SaleDetails)
        _context.Sales.Remove(sale);
        await _context.SaveChangesAsync();
    }
}
