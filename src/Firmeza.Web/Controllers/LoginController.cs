using Microsoft.AspNetCore.Mvc;

namespace Firmeza.Web.Controllers;

public class LoginController : Controller
{
    public IActionResult Index()
    {
        return View();
    }

    [HttpPost]
    public IActionResult Authenticate([FromBody] LoginRequestModel model)
    {
        if (string.IsNullOrWhiteSpace(model.Email) || string.IsNullOrWhiteSpace(model.Password))
            return BadRequest(new { message = "Correo y contraseña son requeridos." });

        var role = model.Email.Contains("admin", StringComparison.OrdinalIgnoreCase)
            ? "Administrator"
            : "CorporateUser";

        return Ok(new
        {
            success = true,
            email = model.Email,
            role = role,
            token = "firmeza_auth_" + Guid.NewGuid()
        });
    }

    public class LoginRequestModel
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }
}
