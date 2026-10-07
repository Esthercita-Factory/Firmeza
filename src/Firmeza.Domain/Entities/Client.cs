using Firmeza.Domain.Common;
using Firmeza.Domain.ValueObjects;

namespace Firmeza.Domain.Entities;

public class Client : Entity
{
    public string Name { get; private set; }
    public int Age { get; private set; }

    public PhoneNumber Phone { get; private set; }
    public Email Email { get; private set; }
    public DocumentNumber Document { get; private set; }

    public Guid? EnterpriseId { get; private set; }
    public Enterprise? Enterprise { get; private set; }

    private Client()
    {
    }

    public Client(
        string name,
        int age,
        string phoneNumber,
        string email,
        string document)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException(
                "El nombre es obligatorio.");

        if (age < 18 || age > 120)
            throw new ArgumentException(
                "La edad debe estar entre 18 y 120 años.");

        Name = name;
        Age = age;

        Phone = PhoneNumber.Create(phoneNumber);
        Email = Email.Create(email);
        Document = DocumentNumber.Create(document);
    }
}