using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PropertyManagement.Api.DTOs.Units;
using PropertyManagement.Api.Services.Units;
using System.Security.Claims;

namespace PropertyManagement.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UnitsController : ControllerBase
{
    private readonly IUnitService _unitService;
    private readonly ILogger<UnitsController> _logger;

    public UnitsController(
        IUnitService unitService,
        ILogger<UnitsController> logger)
    {
        _unitService = unitService;
        _logger = logger;
    }

    /// <summary>
    /// Returns all units. Available to all authenticated users.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<UnitResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetAll()
    {
        var units = await _unitService.GetAllAsync();
        return Ok(units);
    }

    /// <summary>
/// Returns units belonging to the currently authenticated tenant.
/// Tenant access is restricted to units connected to the tenant's leases.
/// </summary>
[HttpGet("my")]
[Authorize(Roles = "Tenant")]
[ProducesResponseType(typeof(IReadOnlyList<UnitResponse>), StatusCodes.Status200OK)]
[ProducesResponseType(StatusCodes.Status401Unauthorized)]
[ProducesResponseType(StatusCodes.Status403Forbidden)]
public async Task<IActionResult> GetMyUnits()
{
    var userIdClaim =
        User.FindFirstValue(ClaimTypes.NameIdentifier)
        ?? User.FindFirstValue("sub");

    if (!int.TryParse(userIdClaim, out var userId))
    {
        return Unauthorized(new
        {
            message = "Invalid user identity in token."
        });
    }

    _logger.LogInformation(
        "Tenant unit access. UserId: {UserId}",
        userId);

    var units = await _unitService.GetByUserIdAsync(userId);

    return Ok(units);
}

    /// <summary>
    /// Returns a single unit by ID. Available to all authenticated users.
    /// </summary>
    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(UnitResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(int id)
    {
        var unit = await _unitService.GetByIdAsync(id);

        if (unit is null)
        {
            return NotFound(new
            {
                message = $"Unit with ID {id} was not found."
            });
        }

        return Ok(unit);
    }

    /// <summary>
    /// Returns units belonging to a specific building.
    /// Available to all authenticated users.
    /// </summary>
    [HttpGet("by-building/{buildingId:int}")]
    [ProducesResponseType(typeof(IReadOnlyList<UnitResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetByBuildingId(int buildingId)
    {
        var units = await _unitService.GetByBuildingIdAsync(buildingId);

        if (units is null)
        {
            return NotFound(new
            {
                message = $"Building with ID {buildingId} was not found."
            });
        }

        return Ok(units);
    }

    /// <summary>
    /// Creates a new unit. Requires Admin or PropertyManager.
    /// </summary>
    [HttpPost]
    [Authorize(Roles = "Admin,PropertyManager")]
    [ProducesResponseType(typeof(UnitResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Create(
        [FromBody] CreateUnitRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var created = await _unitService.CreateAsync(request);

        if (created is null)
        {
            return NotFound(new
            {
                message = $"Building with ID {request.BuildingId} was not found."
            });
        }

        return CreatedAtAction(
            nameof(GetById),
            new { id = created.Id },
            created);
    }

    [HttpGet("available")]
[Authorize(Roles = "Tenant")]
public async Task<IActionResult> GetAvailableUnits()
{
    var units = await _unitService.GetAvailableUnitsAsync();

    return Ok(units);
}

    /// <summary>
    /// Updates an existing unit. Requires Admin or PropertyManager.
    /// </summary>
    [HttpPut("{id:int}")]
    [Authorize(Roles = "Admin,PropertyManager")]
    [ProducesResponseType(typeof(UnitResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(
        int id,
        [FromBody] UpdateUnitRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var updated = await _unitService.UpdateAsync(id, request);

        if (updated is null)
        {
            return NotFound(new
            {
                message = $"Unit with ID {id} was not found."
            });
        }

        return Ok(updated);
    }

    /// <summary>
    /// Deletes a unit by ID. Requires Admin.
    /// Returns 409 when dependent records exist.
    /// </summary>
    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Delete(int id)
    {
        var deleted = await _unitService.DeleteAsync(id);

        if (!deleted)
        {
            if (_unitService.LastDeleteHadDependencies)
            {
                return Conflict(new
                {
                    message = "This unit cannot be deleted because it has related leases, expenses, or maintenance requests."
                });
            }

            return NotFound(new
            {
                message = $"Unit with ID {id} was not found."
            });
        }

        return NoContent();
    }
}