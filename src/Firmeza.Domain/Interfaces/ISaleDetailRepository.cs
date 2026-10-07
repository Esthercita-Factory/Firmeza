using Firmeza.Domain.Entities;

namespace Firmeza.Domain.Interfaces;

public interface ISaleDetailRepository
{
    IEnumerable<SaleDetail> GetAll();
    SaleDetail GetById(Guid id);

    void Add(SaleDetail saleDetail);
    void Update(SaleDetail saleDetail);
    void Delete(Guid id);
}
