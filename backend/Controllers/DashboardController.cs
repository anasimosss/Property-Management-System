using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PropertyManagement.Api.Services.Dashboard;

namespace PropertyManagement.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DashboardController : ControllerBase
{
    private readonly IDashboardService _dashboardService;

    public DashboardController(IDashboardService dashboardService)
    {
        _dashboardService = dashboardService;
    }

    [HttpGet("summary")]
    public async Task<IActionResult> GetSummary()
    {
        var summary = await _dashboardService.GetSummaryAsync();

        return Ok(summary);
    }
    [HttpGet("financial/{propertyId:int}")]
public async Task<IActionResult> GetFinancialReport(int propertyId)
{
    var report = await _dashboardService.GetFinancialReportAsync(propertyId);

    if (report == null)
    {
        return NotFound(new { message = "Property not found." });
    }

    return Ok(report);
}

[HttpGet("lease-occupancy")]
public async Task<IActionResult> GetLeaseOccupancyReport()
{
    var report = await _dashboardService.GetLeaseOccupancyReportAsync();

    return Ok(report);
}

[HttpGet("maintenance-report")]
public async Task<IActionResult> GetMaintenanceReport()
{
    var report = await _dashboardService.GetMaintenanceReportAsync();

    return Ok(report);
}
}