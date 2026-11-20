using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PropertyManagement.Api.DTOs.MaintenanceRequests;
using PropertyManagement.Api.Services.MaintenanceRequests;

namespace PropertyManagement.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class MaintenanceRequestsController : ControllerBase
{
    private readonly IMaintenanceRequestService _maintenanceService;

    public MaintenanceRequestsController(
        IMaintenanceRequestService maintenanceService)
    {
        _maintenanceService = maintenanceService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var requests = await _maintenanceService.GetAllAsync();
        return Ok(requests);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var request = await _maintenanceService.GetByIdAsync(id);

        if (request is null)
        {
            return NotFound(new
            {
                message =
                    $"Maintenance request with ID {id} was not found."
            });
        }

        return Ok(request);
    }

    [HttpGet("by-property/{propertyId:int}")]
    public async Task<IActionResult> GetByPropertyId(int propertyId)
    {
        var requests =
            await _maintenanceService.GetByPropertyIdAsync(propertyId);

        if (requests is null)
        {
            return NotFound(new
            {
                message =
                    $"Property with ID {propertyId} was not found."
            });
        }

        return Ok(requests);
    }

    [HttpGet("by-unit/{unitId:int}")]
    public async Task<IActionResult> GetByUnitId(int unitId)
    {
        var requests =
            await _maintenanceService.GetByUnitIdAsync(unitId);

        if (requests is null)
        {
            return NotFound(new
            {
                message =
                    $"Unit with ID {unitId} was not found."
            });
        }

        return Ok(requests);
    }

    [HttpPost]
    [Authorize(Roles = "Admin,PropertyManager,MaintenanceStaff")]
    public async Task<IActionResult> Create(
        [FromBody] CreateMaintenanceRequestRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        try
        {
            var created =
                await _maintenanceService.CreateAsync(request);

            if (created is null)
            {
                return NotFound(new
                {
                    message =
                        $"Property with ID {request.PropertyId} was not found."
                });
            }

            return CreatedAtAction(
                nameof(GetById),
                new { id = created.Id },
                created);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new
            {
                message = ex.Message
            });
        }
    }

    [HttpPost("tenant")]
[Authorize(Roles = "Tenant")]
public async Task<IActionResult> CreateForTenant(
    [FromBody] CreateTenantMaintenanceRequestRequest request)
{
    if (!ModelState.IsValid)
    {
        return BadRequest(ModelState);
    }

    var userIdClaim = User.FindFirst(
        System.Security.Claims.ClaimTypes.NameIdentifier);

    if (userIdClaim is null ||
        !int.TryParse(userIdClaim.Value, out var userId))
    {
        return Unauthorized(new
        {
            message = "Unable to identify the logged-in tenant."
        });
    }

    try
    {
        var created = await _maintenanceService.CreateForTenantAsync(
            userId,
            request.Title,
            request.Description,
            request.Priority);

        return CreatedAtAction(
            nameof(GetById),
            new { id = created!.Id },
            created);
    }
    catch (InvalidOperationException ex)
    {
        return BadRequest(new
        {
            message = ex.Message
        });
    }
}

    [HttpPut("{id:int}")]
    [Authorize(Roles = "Admin,PropertyManager,MaintenanceStaff")]
    public async Task<IActionResult> Update(
        int id,
        [FromBody] UpdateMaintenanceRequestRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        try
        {
            var updated =
                await _maintenanceService.UpdateAsync(id, request);

            if (updated is null)
            {
                return NotFound(new
                {
                    message =
                        $"Maintenance request with ID {id} was not found."
                });
            }

            return Ok(updated);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new
            {
                message = ex.Message
            });
        }
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var deleted =
            await _maintenanceService.DeleteAsync(id);

        if (!deleted)
        {
            return NotFound(new
            {
                message =
                    $"Maintenance request with ID {id} was not found."
            });
        }

        return NoContent();
    }
}