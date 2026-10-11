using Firmeza.Application.DTOs.Clients;
using Firmeza.Application.DTOs.Common;
using Firmeza.Application.Exceptions;
using Firmeza.Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Firmeza.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class ClientsController : ControllerBase
{
    private readonly IClientService _clientService;

    public ClientsController(IClientService clientService)
    {
        _clientService = clientService;
    }

    /// <summary>
    /// Obtiene la colección paginada de clientes con sus datos principales (Nombres, Documento, Correo, Teléfono, Edad y Estado).
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(PagedResultDto<ClientResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetAll(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] bool? onlyActive = null)
    {
        var result = await _clientService.GetPagedAsync(pageNumber, pageSize, onlyActive);
        return Ok(result);
    }

    /// <summary>
    /// Consulta individual de un cliente por su identificador único (Id).
    /// </summary>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(ClientResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetById([FromRoute] Guid id)
    {
        var client = await _clientService.GetByIdAsync(id);
        if (client == null)
        {
            return NotFound(new { message = $"No se encontró el cliente con identificador '{id}'." });
        }

        return Ok(client);
    }

    /// <summary>
    /// Registra un nuevo cliente garantizando la no duplicidad de documento y correo electrónico.
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(ClientResponseDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Create([FromBody] CreateClientDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        try
        {
            var created = await _clientService.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
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
    /// Actualiza los datos de contacto y perfil de un cliente existente.
    /// Impide la colisión de documento o correo con otros clientes existentes (409 Conflict).
    /// </summary>
    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(ClientResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Update([FromRoute] Guid id, [FromBody] UpdateClientDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

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

    /// <summary>
    /// Aplica una baja lógica / suspensión del cliente (IsActive = false) preservando la integridad referencial.
    /// </summary>
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Delete([FromRoute] Guid id)
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
