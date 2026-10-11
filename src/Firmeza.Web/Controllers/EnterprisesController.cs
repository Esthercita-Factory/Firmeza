using Firmeza.Application.DTOs.Enterprises;
using Firmeza.Application.Exceptions;
using Firmeza.Application.Interfaces.Services;
using Microsoft.AspNetCore.Mvc;

namespace Firmeza.Web.Controllers;

public class EnterprisesController : Controller
{
    private readonly IEnterpriseService _enterpriseService;

    public EnterprisesController(IEnterpriseService enterpriseService)
    {
        _enterpriseService = enterpriseService;
    }

    // Vista principal del módulo de Empresas
    public IActionResult Index()
    {
        return View();
    }

    [HttpGet]
    public async Task<IActionResult> GetPaged([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10, [FromQuery] bool? onlyActive = null)
    {
        var result = await _enterpriseService.GetPagedAsync(pageNumber, pageSize, onlyActive);
        return Json(result);
    }

    [HttpGet]
    public async Task<IActionResult> GetById(Guid id)
    {
        var enterprise = await _enterpriseService.GetByIdAsync(id);
        if (enterprise == null)
            return NotFound(new { message = $"Empresa con Id '{id}' no encontrada." });

        return Json(enterprise);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateEnterpriseDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            var created = await _enterpriseService.CreateAsync(dto);
            return Ok(created);
        }
        catch (ConflictException ex)
        {
            return Conflict(new { message = ex.Message });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateEnterpriseDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            var updated = await _enterpriseService.UpdateAsync(id, dto);
            return Ok(updated);
        }
        catch (NotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (ConflictException ex)
        {
            return Conflict(new { message = ex.Message });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpDelete]
    public async Task<IActionResult> Delete(Guid id)
    {
        try
        {
            await _enterpriseService.DeleteLogicalAsync(id);
            return Ok(new { message = "Empresa suspendida (baja lógica) exitosamente.", id, isActive = false });
        }
        catch (NotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }
}
