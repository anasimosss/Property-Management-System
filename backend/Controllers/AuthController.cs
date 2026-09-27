using System.Security.Claims;
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
public class AuthController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IPasswordHasherService _passwordHasher;
    private readonly ITokenService _tokenService;
    private readonly ILogger<AuthController> _logger;

    public AuthController(
        ApplicationDbContext context,
        IPasswordHasherService passwordHasher,
        ITokenService tokenService,
        ILogger<AuthController> logger)
    {
        _context = context;
        _passwordHasher = passwordHasher;
        _tokenService = tokenService;
        _logger = logger;
    }

    [HttpPost("register")]
[ProducesResponseType(typeof(AuthResponse), StatusCodes.Status201Created)]
[ProducesResponseType(StatusCodes.Status400BadRequest)]
[ProducesResponseType(StatusCodes.Status409Conflict)]
public async Task<IActionResult> Register([FromBody] RegisterRequest request)
{
    if (!ModelState.IsValid)
    {
        return BadRequest(ModelState);
    }

    var normalizedEmail = request.Email.Trim().ToLowerInvariant();

    var emailExists = await _context.Users
        .AnyAsync(u => u.Email.ToLower() == normalizedEmail);

    if (emailExists)
    {
        return Conflict(new
        {
            message = "An account with this email address already exists."
        });
    }

    var passwordHash = _passwordHasher.HashPassword(request.Password);

    // Self-registration always creates a Tenant account.
    var user = new User
    {
        Email = normalizedEmail,
        PasswordHash = passwordHash,
        FirstName = request.FirstName.Trim(),
        LastName = request.LastName.Trim(),
        Role = UserRole.Tenant,
        IsActive = true,
        CreatedAtUtc = DateTime.UtcNow
    };

    // Create the User first so SQL Server generates the User.Id.
    _context.Users.Add(user);
    await _context.SaveChangesAsync();

    // Automatically create the Tenant profile
    // and link it to the newly created User.
    var tenant = new Tenant
    {
        UserId = user.Id,
        FirstName = user.FirstName,
        LastName = user.LastName,
        Email = user.Email,
        PhoneNumber = string.Empty,
        CreatedAtUtc = DateTime.UtcNow
    };

    _context.Tenants.Add(tenant);
    await _context.SaveChangesAsync();

    _logger.LogInformation(
        "New tenant registered successfully. UserId: {UserId}, TenantId: {TenantId}",
        user.Id,
        tenant.Id);

    // Generate JWT after User and Tenant have been created.
    var token = _tokenService.GenerateToken(user);

    return StatusCode(StatusCodes.Status201Created, new AuthResponse
    {
        AccessToken = token,
        TokenType = "Bearer",
        ExpiresAtUtc = _tokenService.GetExpiration(),
        User = ToUserDto(user)
    });
}

    /// <summary>
    /// Authenticate credentials and return JWT bearer token.
    /// </summary>
    [HttpPost("login")]
    [ProducesResponseType(typeof(AuthResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var normalizedEmail = request.Email.Trim().ToLowerInvariant();

        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Email.ToLower() == normalizedEmail);

        if (user == null ||
            !user.IsActive ||
            !_passwordHasher.VerifyPassword(
                request.Password,
                user.PasswordHash))
        {
            return Unauthorized(new
            {
                message = "Invalid email or password."
            });
        }

        _logger.LogInformation(
            "User logged in successfully: {UserId}",
            user.Id);

        var token = _tokenService.GenerateToken(user);

        return Ok(new AuthResponse
        {
            AccessToken = token,
            TokenType = "Bearer",
            ExpiresAtUtc = _tokenService.GetExpiration(),
            User = ToUserDto(user)
        });
    }

    /// <summary>
    /// Get the profile of the currently authenticated user.
    /// </summary>
    [HttpGet("me")]
    [Authorize]
    [ProducesResponseType(typeof(UserDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetCurrentUser()
    {
        var userIdClaim =
            User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue("sub");

        if (string.IsNullOrEmpty(userIdClaim) ||
            !int.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized(new
            {
                message = "Invalid user identity in token."
            });
        }

        var user = await _context.Users.FindAsync(userId);

        if (user == null || !user.IsActive)
        {
            return Unauthorized(new
            {
                message = "User not found or inactive."
            });
        }

        return Ok(ToUserDto(user));
    }

    /// <summary>
    /// Update the profile of the currently authenticated user.
    /// </summary>
    [HttpPut("me")]
    [Authorize]
    [ProducesResponseType(typeof(UserDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> UpdateCurrentUser(
        [FromBody] UpdateProfileRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var userIdClaim =
            User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue("sub");

        if (string.IsNullOrEmpty(userIdClaim) ||
            !int.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized(new
            {
                message = "Invalid user identity in token."
            });
        }

        var user = await _context.Users.FindAsync(userId);

        if (user == null || !user.IsActive)
        {
            return Unauthorized(new
            {
                message = "User not found or inactive."
            });
        }

        user.FirstName = request.FirstName.Trim();
        user.LastName = request.LastName.Trim();

        user.PhoneNumber = string.IsNullOrWhiteSpace(request.PhoneNumber)
            ? null
            : request.PhoneNumber.Trim();

        await _context.SaveChangesAsync();

        _logger.LogInformation(
            "User profile updated successfully: {UserId}",
            user.Id);

        return Ok(ToUserDto(user));
    }

    /// <summary>
    /// Admin authorization verification test endpoint.
    /// </summary>
    [HttpGet("admin-test")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public IActionResult AdminTest()
    {
        return Ok(new
        {
            message =
                "Admin authorization successful. You have access to this restricted endpoint.",
            user = User.Identity?.Name,
            role = User.FindFirstValue(ClaimTypes.Role)
        });
    }

    /// <summary>
    /// Change the password of the currently authenticated user.
    /// </summary>
    [HttpPost("change-password")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> ChangePassword(
        [FromBody] ChangePasswordRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var userIdClaim =
            User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue("sub");

        if (string.IsNullOrEmpty(userIdClaim) ||
            !int.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized(new
            {
                message = "Invalid user identity in token."
            });
        }

        var user = await _context.Users.FindAsync(userId);

        if (user == null || !user.IsActive)
        {
            return Unauthorized(new
            {
                message = "User not found or inactive."
            });
        }

        var currentPasswordValid =
            _passwordHasher.VerifyPassword(
                request.CurrentPassword,
                user.PasswordHash);

        if (!currentPasswordValid)
        {
            return BadRequest(new
            {
                message = "Current password is incorrect."
            });
        }

        if (request.CurrentPassword == request.NewPassword)
        {
            return BadRequest(new
            {
                message =
                    "New password must be different from the current password."
            });
        }

        user.PasswordHash =
            _passwordHasher.HashPassword(request.NewPassword);

        await _context.SaveChangesAsync();

        _logger.LogInformation(
            "User password changed successfully: {UserId}",
            user.Id);

        return Ok(new
        {
            message = "Password changed successfully."
        });
    }

    private static UserDto ToUserDto(User user) => new()
    {
        Id = user.Id,
        Email = user.Email,
        FirstName = user.FirstName,
        LastName = user.LastName,
        PhoneNumber = user.PhoneNumber,
        Role = user.Role.ToString(),
        IsActive = user.IsActive,
        CreatedAtUtc = user.CreatedAtUtc
    };
}