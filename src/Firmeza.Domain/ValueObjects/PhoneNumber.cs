namespace Firmeza.Domain.ValueObjects;

public sealed record PhoneNumber(string Value)
{
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