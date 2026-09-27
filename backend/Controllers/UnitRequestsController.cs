using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PropertyManagement.Api.DTOs.UnitRequests;
using PropertyManagement.Api.Services.UnitRequests;

namespace PropertyManagement.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UnitRequestsController : ControllerBase
{
    private readonly IUnitRequestService _unitRequestService;

    public UnitRequestsController(
        IUnitRequestService unitRequestService)
    {
        _unitRequestService = unitRequestService;
    }

    [HttpPost]
    [Authorize(Roles = "Tenant")]
    public async Task<IActionResult> Create(
        [FromBody] CreateUnitRequestRequest request)
    {
        try
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

            var result =
                await _unitRequestService.CreateAsync(
                    userId,
                    request);

            if (result is null)
            {
                return NotFound(new
                {
                    message =
                        $"Unit with ID {request.UnitId} was not found."
                });
            }

            return CreatedAtAction(
                nameof(GetMyRequests),
                null,
                result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new
            {
                message = ex.Message
            });
        }
    }

    [HttpGet("my")]
    [Authorize(Roles = "Tenant")]
    public async Task<IActionResult> GetMyRequests()
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

        var requests =
            await _unitRequestService.GetMyRequestsAsync(
                userId);

        return Ok(requests);
    }

    [HttpGet]
    [Authorize(Roles = "Admin,PropertyManager")]
    public async Task<IActionResult> GetAll()
    {
        var requests =
            await _unitRequestService.GetAllAsync();

        return Ok(requests);
    }

    [HttpPut("{id:int}/approve")]
    [Authorize(Roles = "Admin,PropertyManager")]
    public async Task<IActionResult> Approve(int id)
    {
        try
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

            var result =
                await _unitRequestService.ApproveAsync(
                    id,
                    userId);

            if (result is null)
            {
                return NotFound(new
                {
                    message =
                        $"Unit request with ID {id} was not found."
                });
            }

            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new
            {
                message = ex.Message
            });
        }
    }

    [HttpPut("{id:int}/reject")]
    [Authorize(Roles = "Admin,PropertyManager")]
    public async Task<IActionResult> Reject(
        int id,
        [FromBody] RejectUnitRequestRequest request)
    {
        try
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

            var result =
                await _unitRequestService.RejectAsync(
                    id,
                    userId,
                    request.RejectionReason);

            if (result is null)
            {
                return NotFound(new
                {
                    message =
                        $"Unit request with ID {id} was not found."
                });
            }

            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new
            {
                message = ex.Message
            });
        }
    }
}