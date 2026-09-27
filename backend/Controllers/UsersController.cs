using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PropertyManagement.Api.Data;
using PropertyManagement.Api.DTOs.Auth;
using PropertyManagement.Api.Entities;
using PropertyManagement.Api.Entities.Enums;
using PropertyManagement.Api.Services;

namespace PropertyManagement.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class UsersController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IPasswordHasherService _passwordHasher;
    private readonly ILogger<UsersController> _logger;

    public UsersController(
        ApplicationDbContext context,
        IPasswordHasherService passwordHasher,
        ILogger<UsersController> logger)
    {
        _context = context;
        _passwordHasher = passwordHasher;
        _logger = logger;
    }

    /// <summary>
    /// Create a new Property Manager, Maintenance Staff, or Tenant.
    /// Only Admin users can access this endpoint.
    /// </summary>
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> CreateUser(
        [FromBody] CreateUserRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        // Admin should not create another Admin through this endpoint.
        if (request.Role == UserRole.Admin)
        {
            return BadRequest(new
            {
                message = "Admin accounts cannot be created through this endpoint."
            });
        }

        var normalizedEmail = request.Email.Trim().ToLowerInvariant();

        var emailExists = await _context.Users
            .AnyAsync(u => u.Email == normalizedEmail);

        if (emailExists)
        {
            return Conflict(new
            {
                message = "An account with this email address already exists."
            });
        }

        var user = new User
        {
            Email = normalizedEmail,
            PasswordHash = _passwordHasher.HashPassword(request.Password),
            FirstName = request.FirstName.Trim(),
            LastName = request.LastName.Trim(),
            PhoneNumber = string.IsNullOrWhiteSpace(request.PhoneNumber)
                ? null
                : request.PhoneNumber.Trim(),
            Role = request.Role,
            IsActive = true,
            CreatedAtUtc = DateTime.UtcNow
        };

        _context.Users.Add(user);

        // Save the User first so SQL Server generates the User.Id.
        await _context.SaveChangesAsync();

        // If the new account is a Tenant, automatically create
        // the corresponding Tenant profile and link it to the User.
        if (user.Role == UserRole.Tenant)
        {
            var tenant = new Tenant
            {
                UserId = user.Id,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Email = user.Email,
                PhoneNumber = user.PhoneNumber ?? string.Empty,
                CreatedAtUtc = DateTime.UtcNow
            };

            _context.Tenants.Add(tenant);
            await _context.SaveChangesAsync();
        }

        _logger.LogInformation(
            "Admin created a new {Role} user. UserId: {UserId}",
            user.Role,
            user.Id);

        return StatusCode(StatusCodes.Status201Created, new
        {
            message = "User created successfully.",
            user = new
            {
                user.Id,
                user.Email,
                user.FirstName,
                user.LastName,
                user.PhoneNumber,
                Role = user.Role.ToString(),
                user.IsActive,
                user.CreatedAtUtc
            }
        });
    }

    /// <summary>
    /// Get all non-admin users.
    /// Only Admin users can access this endpoint.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetUsers()
    {
        var users = await _context.Users
            .Where(u => u.Role != UserRole.Admin)
            .OrderByDescending(u => u.CreatedAtUtc)
            .Select(u => new
            {
                u.Id,
                u.Email,
                u.FirstName,
                u.LastName,
                u.PhoneNumber,
                Role = u.Role.ToString(),
                u.IsActive,
                u.CreatedAtUtc
            })
            .ToListAsync();

        return Ok(users);
    }

    /// <summary>
    /// Get a single non-admin user by ID.
    /// Only Admin users can access this endpoint.
    /// </summary>
    [HttpGet("{id:int}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetUser(int id)
    {
        var user = await _context.Users
            .Where(u => u.Id == id && u.Role != UserRole.Admin)
            .Select(u => new
            {
                u.Id,
                u.Email,
                u.FirstName,
                u.LastName,
                u.PhoneNumber,
                Role = u.Role.ToString(),
                u.IsActive,
                u.CreatedAtUtc
            })
            .FirstOrDefaultAsync();

        if (user is null)
        {
            return NotFound(new
            {
                message = "User not found."
            });
        }

        return Ok(user);
    }

    /// <summary>
    /// Activate or deactivate a non-admin user.
    /// Only Admin users can access this endpoint.
    /// </summary>
    [HttpPatch("{id:int}/status")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> UpdateUserStatus(int id)
    {
    var user = await _context.Users
        .FirstOrDefaultAsync(u => u.Id == id && u.Role != UserRole.Admin);

    if (user is null)
    {
        return NotFound(new
        {
            message = "User not found."
        });
    }

    user.IsActive = !user.IsActive;

    await _context.SaveChangesAsync();

    _logger.LogInformation(
        "Admin changed user {UserId} status to {IsActive}",
        user.Id,
        user.IsActive);

    return Ok(new
    {
        message = user.IsActive
            ? "User activated successfully."
            : "User deactivated successfully.",
        user = new
        {
            user.Id,
            user.Email,
            user.FirstName,
            user.LastName,
            user.PhoneNumber,
            Role = user.Role.ToString(),
            user.IsActive,
            user.CreatedAtUtc
        }
    });
}


[HttpDelete("{id:int}")]
[ProducesResponseType(StatusCodes.Status204NoContent)]
[ProducesResponseType(StatusCodes.Status404NotFound)]
[ProducesResponseType(StatusCodes.Status409Conflict)]
[ProducesResponseType(StatusCodes.Status403Forbidden)]
public async Task<IActionResult> DeleteUser(int id)
{
    var user = await _context.Users
        .FirstOrDefaultAsync(u => u.Id == id && u.Role != UserRole.Admin);

    if (user is null)
    {
        return NotFound(new
        {
            message = "User not found."
        });
    }

    if (user.Role == UserRole.Tenant)
    {
        var tenant = await _context.Tenants
            .FirstOrDefaultAsync(t => t.UserId == user.Id);

        if (tenant is not null)
        {
            var hasLeases = await _context.Leases
                .AnyAsync(l => l.TenantId == tenant.Id);

            if (hasLeases)
            {
                return Conflict(new
                {
                    message = "This tenant cannot be deleted because they have related lease records."
                });
            }

            var hasPayments = await _context.Payments
                .AnyAsync(p => p.Lease != null && p.Lease.TenantId == tenant.Id);

            if (hasPayments)
            {
                return Conflict(new
                {
                    message = "This tenant cannot be deleted because they have related payment records."
                });
            }

            _context.Tenants.Remove(tenant);
        }
    }

    _context.Users.Remove(user);

    await _context.SaveChangesAsync();

    _logger.LogInformation(
        "Admin deleted user {UserId}",
        user.Id);

    return NoContent();
}
}