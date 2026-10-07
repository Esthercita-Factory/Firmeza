using Firmeza.Domain.Entities;

namespace Firmeza.Domain.Interfaces;

public interface ISaleRepository
{
    IEnumerable<Sale> GetAll();
    Sale GetById(Guid id);

    void Add(Sale sale);
    void Update(Sale sale);
    void Delete(Guid id);
}