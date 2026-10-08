using Firmeza.Application.Interfaces.Repositories;
using Firmeza.Domain.Entities;
using Firmeza.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Firmeza.Infrastructure.Repositories;

public class SaleDetailRepository : ISaleDetailRepository
{
    private readonly AppDbContext _context;

    public SaleDetailRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<SaleDetail>> GetAllAsync()
    {
        return await _context.SaleDetails
            .Include(sd => sd.Product)
            .Include(sd => sd.Sale)
            .ToListAsync();
    }

    public async Task<IEnumerable<SaleDetail>> GetAllPagedAsync(int pageNumber, int pageSize)
    {
        return await _context.SaleDetails
            .Include(sd => sd.Product)
            .Include(sd => sd.Sale)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();
    }

    public async Task<SaleDetail?> GetByIdAsync(Guid id)
    {
        return await _context.SaleDetails
            .Include(sd => sd.Product)
            .Include(sd => sd.Sale)
            .FirstOrDefaultAsync(sd => sd.Id == id);
    }

    public async Task AddAsync(SaleDetail saleDetail)
    {
        var productExists = await _context.Products
            .AnyAsync(p => p.Id == saleDetail.ProductId);

        if (!productExists)
            throw new InvalidOperationException("El producto especificado no existe.");

        var saleExists = await _context.Sales
            .AnyAsync(s => s.Id == saleDetail.SaleId);

        if (!saleExists)
            throw new InvalidOperationException("La venta especificada no existe.");

        await _context.SaleDetails.AddAsync(saleDetail);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(SaleDetail saleDetail)
    {
        var existingSaleDetail = await _context.SaleDetails
            .FirstOrDefaultAsync(sd => sd.Id == saleDetail.Id);

        if (existingSaleDetail == null)
            throw new InvalidOperationException("Detalle de venta no encontrado.");

        var productExists = await _context.Products
            .AnyAsync(p => p.Id == saleDetail.ProductId);

        if (!productExists)
            throw new InvalidOperationException("El producto especificado no existe.");

        var saleExists = await _context.Sales
            .AnyAsync(s => s.Id == saleDetail.SaleId);

        if (!saleExists)
            throw new InvalidOperationException("La venta especificada no existe.");

        _context.Entry(existingSaleDetail).CurrentValues.SetValues(saleDetail);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteLogicalAsync(Guid id)
    {
        var saleDetail = await _context.SaleDetails.FindAsync(id);
        if (saleDetail == null)
            throw new InvalidOperationException("Detalle de venta no encontrado.");

        // Implementación de borrado lógico si se agrega propiedad IsDeleted
        // Por ahora, eliminación física
        _context.SaleDetails.Remove(saleDetail);
        await _context.SaveChangesAsync();
    }
}
