using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PropertyManagement.Api.DTOs.Buildings;
using PropertyManagement.Api.Services;
using System.Security.Claims;

namespace PropertyManagement.Api.Controllers;

/// <summary>
/// Building CRUD endpoints.
/// GET: all authenticated roles.
/// CREATE / UPDATE: Admin, PropertyManager.
/// DELETE: Admin only.
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class BuildingsController : ControllerBase
{
    private readonly IBuildingService _buildingService;
    private readonly ILogger<BuildingsController> _logger;

    public BuildingsController(IBuildingService buildingService, ILogger<BuildingsController> logger)
    {
        _buildingService = buildingService;
        _logger = logger;
    }

    /// <summary>
    /// Returns a list of all buildings. Available to all authenticated users.
    /// </summary>
   [HttpGet]
[Authorize(Roles = "Admin,PropertyManager")]
[ProducesResponseType(typeof(IReadOnlyList<BuildingResponse>), StatusCodes.Status200OK)]
[ProducesResponseType(StatusCodes.Status401Unauthorized)]
[ProducesResponseType(StatusCodes.Status403Forbidden)]
public async Task<IActionResult> GetAll()
    {
        var buildings = await _buildingService.GetAllAsync();
        return Ok(buildings);
    }

    /// <summary>
/// Returns buildings belonging to the currently authenticated tenant.
/// </summary>
[HttpGet("my")]
[Authorize(Roles = "Tenant")]
[ProducesResponseType(typeof(IReadOnlyList<BuildingResponse>), StatusCodes.Status200OK)]
[ProducesResponseType(StatusCodes.Status401Unauthorized)]
[ProducesResponseType(StatusCodes.Status403Forbidden)]
public async Task<IActionResult> GetMyBuildings()
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
        "Tenant building access. UserId: {UserId}",
        userId);

    var buildings = await _buildingService.GetByUserIdAsync(userId);

    return Ok(buildings);
}

    /// <summary>
    /// Returns a single building by ID. Available to all authenticated users.
    /// </summary>
   [HttpGet("{id:int}")]
[Authorize(Roles = "Admin,PropertyManager")]
    [ProducesResponseType(typeof(BuildingResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(int id)
    {
        var building = await _buildingService.GetByIdAsync(id);

        if (building is null)
        {
            return NotFound(new { message = $"Building with ID {id} was not found." });
        }

        return Ok(building);
    }

    /// <summary>
    /// Returns buildings belonging to a specific property. Available to all authenticated users.
    /// </summary>
    [HttpGet("by-property/{propertyId:int}")]
[Authorize(Roles = "Admin,PropertyManager")]
    [ProducesResponseType(typeof(IReadOnlyList<BuildingResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetByPropertyId(int propertyId)
    {
        var buildings = await _buildingService.GetByPropertyIdAsync(propertyId);

        if (buildings is null)
        {
            return NotFound(new { message = $"Property with ID {propertyId} was not found." });
        }

        return Ok(buildings);
    }

    /// <summary>
    /// Creates a new building. Requires Admin or PropertyManager role.
    /// </summary>
    [HttpPost]
    [Authorize(Roles = "Admin,PropertyManager")]
    [ProducesResponseType(typeof(BuildingResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> Create([FromBody] CreateBuildingRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        try
        {
            var created = await _buildingService.CreateAsync(request);

            return CreatedAtAction(
                nameof(GetById),
                new { id = created.Id },
                created);
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Updates an existing building. Requires Admin or PropertyManager role.
    /// </summary>
    [HttpPut("{id:int}")]
    [Authorize(Roles = "Admin,PropertyManager")]
    [ProducesResponseType(typeof(BuildingResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateBuildingRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var updated = await _buildingService.UpdateAsync(id, request);

        if (updated is null)
        {
            return NotFound(new { message = $"Building with ID {id} was not found." });
        }

        return Ok(updated);
    }

    /// <summary>
    /// Deletes a building by ID. Requires Admin role.
    /// Will return 409 Conflict if dependent records (Units with Leases, or Expenses) exist.
    /// Building → Unit will cascade automatically when safe to do so.
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
        var (found, deleted, conflictReason) = await _buildingService.DeleteAsync(id);

        if (!found)
        {
            return NotFound(new { message = $"Building with ID {id} was not found." });
        }

        if (!deleted)
        {
            return Conflict(new { message = conflictReason });
        }

        return NoContent();
    }
}
