using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PropertyManagement.Api.DTOs.Properties;
using PropertyManagement.Api.Services;
using System.Security.Claims;

namespace PropertyManagement.Api.Controllers;

/// <summary>
/// Property CRUD endpoints.
/// GET: all authenticated roles.
/// CREATE / UPDATE: Admin, PropertyManager.
/// DELETE: Admin only.
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PropertiesController : ControllerBase
{
    private readonly IPropertyService _propertyService;
    private readonly ILogger<PropertiesController> _logger;

    public PropertiesController(IPropertyService propertyService, ILogger<PropertiesController> logger)
    {
        _propertyService = propertyService;
        _logger = logger;
    }

    /// <summary>
    /// Returns a list of all properties. Available to all authenticated users.
    /// </summary>
   [HttpGet]
[Authorize(Roles = "Admin,PropertyManager,MaintenanceStaff")]
[ProducesResponseType(typeof(IReadOnlyList<PropertyResponse>), StatusCodes.Status200OK)]
[ProducesResponseType(StatusCodes.Status401Unauthorized)]
[ProducesResponseType(StatusCodes.Status403Forbidden)]
public async Task<IActionResult> GetAll()
    {
        var properties = await _propertyService.GetAllAsync();
        return Ok(properties);
    }

    /// <summary>
/// Returns properties belonging to the currently authenticated tenant.
/// </summary>
[HttpGet("my")]
[Authorize(Roles = "Tenant")]
[ProducesResponseType(typeof(IReadOnlyList<PropertyResponse>), StatusCodes.Status200OK)]
[ProducesResponseType(StatusCodes.Status401Unauthorized)]
[ProducesResponseType(StatusCodes.Status403Forbidden)]
public async Task<IActionResult> GetMyProperties()
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
        "Tenant property access. UserId: {UserId}",
        userId);

    var properties = await _propertyService.GetByUserIdAsync(userId);

    return Ok(properties);
}

    /// <summary>
    /// Returns a single property by ID. Available to all authenticated users.
    /// </summary>
   [HttpGet("{id:int}")]
[Authorize(Roles = "Admin,PropertyManager")]
    [ProducesResponseType(typeof(PropertyResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(int id)
    {
        var property = await _propertyService.GetByIdAsync(id);

        if (property is null)
        {
            return NotFound(new { message = $"Property with ID {id} was not found." });
        }

        return Ok(property);
    }

    /// <summary>
    /// Creates a new property. Requires Admin or PropertyManager role.
    /// </summary>
    [HttpPost]
    [Authorize(Roles = "Admin,PropertyManager")]
    [ProducesResponseType(typeof(PropertyResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> Create([FromBody] CreatePropertyRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var created = await _propertyService.CreateAsync(request);

        return CreatedAtAction(
            nameof(GetById),
            new { id = created.Id },
            created);
    }

    /// <summary>
    /// Updates an existing property. Requires Admin or PropertyManager role.
    /// </summary>
    [HttpPut("{id:int}")]
    [Authorize(Roles = "Admin,PropertyManager")]
    [ProducesResponseType(typeof(PropertyResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(int id, [FromBody] UpdatePropertyRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var updated = await _propertyService.UpdateAsync(id, request);

        if (updated is null)
        {
            return NotFound(new { message = $"Property with ID {id} was not found." });
        }

        return Ok(updated);
    }

    /// <summary>
    /// Deletes a property by ID. Requires Admin role.
    /// Will return 409 Conflict if dependent records (Expenses, MaintenanceRequests, or Leases) exist.
    /// Property → Building and Building → Unit will cascade automatically when safe to do so.
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
        var (found, deleted, conflictReason) = await _propertyService.DeleteAsync(id);

        if (!found)
        {
            return NotFound(new { message = $"Property with ID {id} was not found." });
        }

        if (!deleted)
        {
            return Conflict(new { message = conflictReason });
        }

        return NoContent();
    }
}
