namespace Firmeza.Domain.ValueObjects;

public sealed class Email
{
    public string Value { get; }

    private Email(string value)
    {
        Value = value;
    }

    public static Email Create(string value)
    {
        if (string.IsNullOrWhiteSpace(value))
            throw new ArgumentException(
                "El email es obligatorio.");

        if (!value.Contains('@'))
            throw new ArgumentException(
                "El email no tiene un formato válido.");

        return new Email(value);
    }
}