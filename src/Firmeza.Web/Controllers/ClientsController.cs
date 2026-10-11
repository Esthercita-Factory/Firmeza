using Firmeza.Application.DTOs.Clients;
using Firmeza.Application.Exceptions;
using Firmeza.Application.Interfaces.Services;
using Microsoft.AspNetCore.Mvc;

namespace Firmeza.Web.Controllers;

public class ClientsController : Controller
{
    private readonly IClientService _clientService;
    private readonly IEnterpriseService _enterpriseService;

    public ClientsController(
        IClientService clientService,
        IEnterpriseService enterpriseService)
    {
        _clientService = clientService;
        _enterpriseService = enterpriseService;
    }

    // Vista principal del módulo de Clientes
    public IActionResult Index()
    {
        return View();
    }

    [HttpGet]
    public async Task<IActionResult> GetPaged([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10, [FromQuery] bool? onlyActive = null)
    {
        var result = await _clientService.GetPagedAsync(pageNumber, pageSize, onlyActive);
        return Json(result);
    }

    [HttpGet]
    public async Task<IActionResult> GetById(Guid id)
    {
        var client = await _clientService.GetByIdAsync(id);
        if (client == null)
            return NotFound(new { message = $"Cliente con Id '{id}' no encontrado." });

        return Json(client);
    }

    [HttpGet]
    public async Task<IActionResult> GetEnterprisesList()
    {
        var enterprises = await _enterpriseService.GetAllAsync();
        return Json(enterprises.Select(e => new { e.Id, e.Name, e.TaxId }));
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateClientDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            var created = await _clientService.CreateAsync(dto);
            return Ok(created);
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

    [HttpPut]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateClientDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            var updated = await _clientService.UpdateAsync(id, dto);
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
            await _clientService.DeleteLogicalAsync(id);
            return Ok(new { message = "Cliente suspendido (baja lógica) exitosamente.", id, isActive = false });
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
