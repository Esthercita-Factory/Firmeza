namespace Firmeza.Domain.ValueObjects;

public sealed class Money
{
    public decimal Amount { get; }

    private Money(decimal amount)
    {
        Amount = amount;
    }

    public static Money Create(decimal amount)
    {
        if (amount < 0)
            throw new ArgumentException(
                "El valor monetario no puede ser negativo.");

        return new Money(amount);
    }
}