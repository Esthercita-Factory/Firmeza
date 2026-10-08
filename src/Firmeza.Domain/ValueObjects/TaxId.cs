namespace Firmeza.Domain.ValueObjects;

public sealed record TaxId(string Value)
{
    public static TaxId Create(string value)
    {
        if (string.IsNullOrWhiteSpace(value))
            throw new ArgumentException(
                "El identificador fiscal es obligatorio.");

        if (value.Length < 8)
            throw new ArgumentException(
                "El identificador fiscal no es válido.");

        return new TaxId(value);
    }
}
