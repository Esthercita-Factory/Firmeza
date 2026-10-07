using Firmeza.Domain.Entities;

namespace Firmeza.Domain.Interfaces;

public interface ICustomerRepository
{
    IEnumerable<Client> GetAll();
    Client GetById(Guid id);

    void Add(Client client);
    void Update(Client client);
    void Delete(Guid id);
}                                                             