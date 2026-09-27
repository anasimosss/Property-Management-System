using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PropertyManagement.Api.DTOs.Tenants;
using PropertyManagement.Api.Services.Tenants;

namespace PropertyManagement.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin,PropertyManager")]
public class TenantsController : ControllerBase
{
    private readonly ITenantService _tenantService;
    private readonly ILogger<TenantsController> _logger;

    public TenantsController(
        ITenantService tenantService,
        ILogger<TenantsController> logger)
    {
        _tenantService = tenantService;
        _logger = logger;
    }

    /// <summary>
    /// Returns tenants according to the authenticated user's role.
    /// Admin and PropertyManager can access the tenant list.
    /// Tenant can access only their own tenant record.
    /// </summary>
    [HttpGet]
[ProducesResponseType(typeof(IReadOnlyList<TenantResponse>), StatusCodes.Status200OK)]
[ProducesResponseType(StatusCodes.Status401Unauthorized)]
[ProducesResponseType(StatusCodes.Status403Forbidden)]
public async Task<IActionResult> GetAll()
{
    var tenants = await _tenantService.GetAllAsync();

    return Ok(tenants);
}

    /// <summary>
    /// Returns a single tenant.
    /// A Tenant can only access their own tenant record.
    /// </summary>
    [HttpGet("{id:int}")]
[ProducesResponseType(typeof(TenantResponse), StatusCodes.Status200OK)]
[ProducesResponseType(StatusCodes.Status401Unauthorized)]
[ProducesResponseType(StatusCodes.Status403Forbidden)]
[ProducesResponseType(StatusCodes.Status404NotFound)]
public async Task<IActionResult> GetById(int id)
{
    var tenant = await _tenantService.GetByIdAsync(id);

    if (tenant is null)
    {
        return NotFound(new
        {
            message = $"Tenant with ID {id} was not found."
        });
    }

    return Ok(tenant);
}

    /// <summary>
    /// Creates a new tenant. Requires Admin or PropertyManager.
    /// </summary>
    [HttpPost]
    [Authorize(Roles = "Admin,PropertyManager")]
    [ProducesResponseType(typeof(TenantResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Create(
        [FromBody] CreateTenantRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        try
        {
            var created = await _tenantService.CreateAsync(request);

            if (created is null)
            {
                return NotFound(new
                {
                    message = request.UserId.HasValue
                        ? $"User with ID {request.UserId.Value} was not found."
                        : "The specified user was not found."
                });
            }

            return CreatedAtAction(
                nameof(GetById),
                new { id = created.Id },
                created);
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Updates an existing tenant. Requires Admin or PropertyManager.
    /// </summary>
    [HttpPut("{id:int}")]
    [Authorize(Roles = "Admin,PropertyManager")]
    [ProducesResponseType(typeof(TenantResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Update(
        int id,
        [FromBody] UpdateTenantRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        try
        {
            var updated = await _tenantService.UpdateAsync(id, request);

            if (updated is null)
            {
                return NotFound(new
                {
                    message = $"Tenant with ID {id} was not found."
                });
            }

            return Ok(updated);
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Deletes a tenant. Requires Admin.
    /// Returns 409 if leases or maintenance requests exist.
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
        var deleted = await _tenantService.DeleteAsync(id);

        if (!deleted)
        {
            if (_tenantService.LastDeleteHadDependencies)
            {
                return Conflict(new
                {
                    message =
                        "This tenant cannot be deleted because they have related leases or maintenance requests."
                });
            }

            return NotFound(new
            {
                message = $"Tenant with ID {id} was not found."
            });
        }

        return NoContent();
    }

   
}