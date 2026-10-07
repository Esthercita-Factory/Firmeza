using Microsoft.AspNetCore.Mvc;

namespace Firmeza.Web.Controllers
{
    public class LoginController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
