using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PropertyManagement.Api.Data;

namespace PropertyManagement.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HealthController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<HealthController> _logger;

    public HealthController(ApplicationDbContext context, ILogger<HealthController> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Basic API health check endpoint.
    /// </summary>
    [HttpGet]
    public IActionResult GetHealth()
    {
        return Ok(new
        {
            status = "Healthy",
            service = "PropertyManagement.Api",
            timestamp = DateTime.UtcNow
        });
    }

    /// <summary>
    /// Database connectivity verification endpoint.
    /// </summary>
    [HttpGet("db")]
    public async Task<IActionResult> GetDatabaseHealth()
    {
        try
        {
            var canConnect = await _context.Database.CanConnectAsync();

            if (canConnect)
            {
                return Ok(new
                {
                    status = "Healthy",
                    database = "PropertyManagementDb",
                    canConnect = true,
                    provider = _context.Database.ProviderName,
                    timestamp = DateTime.UtcNow
                });
            }

            return StatusCode(StatusCodes.Status503ServiceUnavailable, new
            {
                status = "Unhealthy",
                database = "PropertyManagementDb",
                canConnect = false,
                timestamp = DateTime.UtcNow
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Database health check failed.");
            return StatusCode(StatusCodes.Status503ServiceUnavailable, new
            {
                status = "Unhealthy",
                database = "PropertyManagementDb",
                canConnect = false,
                error = ex.Message,
                timestamp = DateTime.UtcNow
            });
        }
    }
}
