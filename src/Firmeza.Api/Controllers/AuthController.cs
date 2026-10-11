using Firmeza.Api.DTOs.Auth;
using Firmeza.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace Firmeza.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IJwtTokenService _jwtTokenService;

    public AuthController(IJwtTokenService jwtTokenService)
    {
        _jwtTokenService = jwtTokenService;
    }

    /// <summary>
    /// Genera un token JWT para autenticar las peticiones a los endpoints protegidos.
    /// </summary>
    [HttpPost("login")]
    [ProducesResponseType(typeof(LoginResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public IActionResult Login([FromBody] LoginRequestDto request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        // Credenciales válidas para el Administrador / Usuario Corporativo
        // (o cualquier usuario corporativo con contraseña válida)
        if (string.IsNullOrWhiteSpace(request.Password) || request.Password.Length < 4)
        {
            return Unauthorized(new { message = "Credenciales inválidas. La contraseña es requerida." });
        }

        var role = request.Email.Contains("admin", StringComparison.OrdinalIgnoreCase) 
            ? "Administrator" 
            : "CorporateUser";

        var token = _jwtTokenService.GenerateToken(request.Email, role);

        return Ok(new LoginResponseDto
        {
            Token = token,
            TokenType = "Bearer",
            ExpiresIn = 3600,
            Email = request.Email,
            Role = role
        });
    }
}
