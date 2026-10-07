namespace Firmeza.Domain.ValueObjects;

public sealed class DocumentNumber
{
    public string Value { get; }

    private DocumentNumber(string value)
    {
        Value = value;
    }

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