using Firmeza.Application.DTOs.Common;
using Firmeza.Application.DTOs.Enterprises;
using Firmeza.Application.Exceptions;
using Firmeza.Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Firmeza.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class EnterprisesController : ControllerBase
{
    private readonly IEnterpriseService _enterpriseService;

    public EnterprisesController(IEnterpriseService enterpriseService)
    {
        _enterpriseService = enterpriseService;
    }

    /// <summary>
    /// Obtiene la colección paginada de empresas con sus datos principales (Razón social, NIT, Nombre comercial, Correo, Teléfono y Estado).
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(PagedResultDto<EnterpriseResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetAll(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] bool? onlyActive = null)
    {
        var result = await _enterpriseService.GetPagedAsync(pageNumber, pageSize, onlyActive);
        return Ok(result);
    }

    /// <summary>
    /// Consulta individual de una empresa por su identificador único (Id).
    /// </summary>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(EnterpriseResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetById([FromRoute] Guid id)
    {
        var enterprise = await _enterpriseService.GetByIdAsync(id);
        if (enterprise == null)
        {
            return NotFound(new { message = $"No se encontró la empresa con identificador '{id}'." });
        }

        return Ok(enterprise);
    }

    /// <summary>
    /// Registra una nueva empresa garantizando la no duplicidad de NIT y correo electrónico.
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(EnterpriseResponseDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Create([FromBody] CreateEnterpriseDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        try
        {
            var created = await _enterpriseService.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
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

    /// <summary>
    /// Actualiza los datos organizacionales y de contacto de una empresa existente.
    /// Impide la colisión de NIT o correo con otras empresas (409 Conflict).
    /// </summary>
    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(EnterpriseResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Update([FromRoute] Guid id, [FromBody] UpdateEnterpriseDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

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

    /// <summary>
    /// Aplica una baja lógica / suspensión de la empresa (IsActive = false) preservando la integridad referencial.
    /// </summary>
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Delete([FromRoute] Guid id)
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
