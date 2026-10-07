namespace Firmeza.Domain.ValueObjects;

public sealed class PhoneNumber
{
    public string Value { get; }

    private PhoneNumber(string value)
    {
        Value = value;
    }

    public static PhoneNumber Create(string value)
    {
        if (string.IsNullOrWhiteSpace(value))
            throw new ArgumentException(
                "El teléfono es obligatorio.");

        if (value.Length < 7)
            throw new ArgumentException(
                "El teléfono no es válido.");

        return new PhoneNumber(value);
    }
}