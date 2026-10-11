using System.ComponentModel.DataAnnotations;

namespace Firmeza.Api.DTOs.Auth;

public class LoginRequestDto
{
    [Required(ErrorMessage = "El correo electrónico o usuario es requerido.")]
    [EmailAddress(ErrorMessage = "Formato de correo inválido.")]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "La contraseña es requerida.")]
    public string Password { get; set; } = string.Empty;
}

public class LoginResponseDto
{
    public string Token { get; set; } = string.Empty;
    public string TokenType { get; set; } = "Bearer";
    public int ExpiresIn { get; set; }
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
}
