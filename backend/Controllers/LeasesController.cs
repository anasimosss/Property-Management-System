using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PropertyManagement.Api.DTOs.Leases;
using PropertyManagement.Api.Services.Leases;

namespace PropertyManagement.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class LeasesController : ControllerBase
{
    private readonly ILeaseService _leaseService;
    private readonly ILogger<LeasesController> _logger;

    public LeasesController(
        ILeaseService leaseService,
        ILogger<LeasesController> logger)
    {
        _leaseService = leaseService;
        _logger = logger;
    }

    /// <summary>
    /// Returns all leases.
    /// Admin and PropertyManager receive all leases.
    /// Tenant receives only their own leases.
    /// MaintenanceStaff cannot access leases.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<LeaseResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetAll()
    {
        var role = User.FindFirstValue(ClaimTypes.Role);

        if (role == "MaintenanceStaff")
        {
            return Forbid();
        }

        if (role == "Tenant")
        {
            var userId = GetCurrentUserId();

            if (userId is null)
            {
                return Unauthorized(new
                {
                    message = "Invalid user identity in token."
                });
            }

            _logger.LogInformation(
                "Tenant lease access. UserId: {UserId}",
                userId.Value);

            var ownLeases = await _leaseService.GetByUserIdAsync(userId.Value);

            return Ok(ownLeases);
        }

        var allLeases = await _leaseService.GetAllAsync();

        return Ok(allLeases);
    }

    /// <summary>
    /// Returns a single lease.
    /// Tenants can only access their own lease.
    /// </summary>
    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(LeaseResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(int id)
    {
        var role = User.FindFirstValue(ClaimTypes.Role);

        if (role == "MaintenanceStaff")
        {
            return Forbid();
        }

        var lease = await _leaseService.GetByIdAsync(id);

        if (lease is null)
        {
            return NotFound(new
            {
                message = $"Lease with ID {id} was not found."
            });
        }

        if (role == "Tenant")
        {
            var userId = GetCurrentUserId();

            if (userId is null)
            {
                return Unauthorized(new
                {
                    message = "Invalid user identity in token."
                });
            }

            var ownLeases = await _leaseService.GetByUserIdAsync(userId.Value);

            if (!ownLeases.Any(l => l.Id == id))
            {
                return Forbid();
            }
        }

        return Ok(lease);
    }

    /// <summary>
    /// Returns leases for a specific unit.
    /// Tenants only receive their own leases for that unit.
    /// </summary>
    [HttpGet("by-unit/{unitId:int}")]
    [ProducesResponseType(typeof(IReadOnlyList<LeaseResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetByUnitId(int unitId)
    {
        var role = User.FindFirstValue(ClaimTypes.Role);

        if (role == "MaintenanceStaff")
        {
            return Forbid();
        }

        if (role == "Tenant")
        {
            var userId = GetCurrentUserId();

            if (userId is null)
            {
                return Unauthorized(new
                {
                    message = "Invalid user identity in token."
                });
            }

            var ownLeases = await _leaseService.GetByUserIdAsync(userId.Value);

            var ownUnitLeases = ownLeases
                .Where(l => l.UnitId == unitId)
                .ToList();

            return Ok(ownUnitLeases);
        }

        var leases = await _leaseService.GetByUnitIdAsync(unitId);

        if (leases is null)
        {
            return NotFound(new
            {
                message = $"Unit with ID {unitId} was not found."
            });
        }

        return Ok(leases);
    }

    /// <summary>
    /// Returns leases for a specific tenant.
    /// Tenants only receive leases belonging to their own user-linked tenant profile.
    /// </summary>
    [HttpGet("by-tenant/{tenantId:int}")]
    [ProducesResponseType(typeof(IReadOnlyList<LeaseResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetByTenantId(int tenantId)
    {
        var role = User.FindFirstValue(ClaimTypes.Role);

        if (role == "MaintenanceStaff")
        {
            return Forbid();
        }

        if (role == "Tenant")
        {
            var userId = GetCurrentUserId();

            if (userId is null)
            {
                return Unauthorized(new
                {
                    message = "Invalid user identity in token."
                });
            }

            var ownLeases = await _leaseService.GetByUserIdAsync(userId.Value);

            var ownTenantLeases = ownLeases
                .Where(l => l.TenantId == tenantId)
                .ToList();

            return Ok(ownTenantLeases);
        }

        var leases = await _leaseService.GetByTenantIdAsync(tenantId);

        if (leases is null)
        {
            return NotFound(new
            {
                message = $"Tenant with ID {tenantId} was not found."
            });
        }

        return Ok(leases);
    }

    /// <summary>
    /// Creates a new lease. Requires Admin or PropertyManager.
    /// </summary>
    [HttpPost]
    [Authorize(Roles = "Admin,PropertyManager")]
    [ProducesResponseType(typeof(LeaseResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Create(
        [FromBody] CreateLeaseRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        try
        {
            var created = await _leaseService.CreateAsync(request);

            if (created is null)
            {
                return NotFound(new
                {
                    message = "The specified Unit or Tenant was not found."
                });
            }

            return CreatedAtAction(
                nameof(GetById),
                new { id = created.Id },
                created);
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new
            {
                message = ex.Message
            });
        }
    }

    /// <summary>
    /// Updates an existing lease. Requires Admin or PropertyManager.
    /// </summary>
    [HttpPut("{id:int}")]
    [Authorize(Roles = "Admin,PropertyManager")]
    [ProducesResponseType(typeof(LeaseResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Update(
        int id,
        [FromBody] UpdateLeaseRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        try
        {
            var updated = await _leaseService.UpdateAsync(id, request);

            if (updated is null)
            {
                return NotFound(new
                {
                    message = $"Lease with ID {id} was not found."
                });
            }

            return Ok(updated);
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new
            {
                message = ex.Message
            });
        }
    }

    /// <summary>
    /// Deletes a lease. Requires Admin.
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
        var deleted = await _leaseService.DeleteAsync(id);

        if (!deleted)
        {
            if (_leaseService.LastDeleteHadPayments)
            {
                return Conflict(new
                {
                    message =
                        "This lease cannot be deleted because it has related payments."
                });
            }

            return NotFound(new
            {
                message = $"Lease with ID {id} was not found."
            });
        }

        return NoContent();
    }

    private int? GetCurrentUserId()
    {
        var userIdClaim =
            User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue("sub");

        if (string.IsNullOrWhiteSpace(userIdClaim))
        {
            return null;
        }

        return int.TryParse(userIdClaim, out var userId)
            ? userId
            : null;
    }
}