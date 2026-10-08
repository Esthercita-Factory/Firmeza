namespace Firmeza.Domain.ValueObjects;

public sealed record DocumentNumber(string Value)
{
    public static DocumentNumber Create(string value)
    {
        if (string.IsNullOrWhiteSpace(value))
            throw new ArgumentException(
                "El documento es obligatorio.");

        if (value.Length < 5)
            throw new ArgumentException(
                "El documento no es válido.");

        return new DocumentNumber(value);
    }
}