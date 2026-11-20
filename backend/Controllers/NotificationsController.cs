using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PropertyManagement.Api.Services.Notifications;

namespace PropertyManagement.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class NotificationsController : ControllerBase
{
    private readonly INotificationService _notificationService;

    public NotificationsController(
        INotificationService notificationService)
    {
        _notificationService = notificationService;
    }

    private int GetCurrentUserId()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (!int.TryParse(userId, out var id))
        {
            throw new UnauthorizedAccessException(
                "User ID is missing from the token.");
        }

        return id;
    }

    // GET: api/Notifications
    [HttpGet]
    public async Task<IActionResult> GetMyNotifications()
    {
        var userId = GetCurrentUserId();

        var notifications =
            await _notificationService.GetMyNotificationsAsync(userId);

        return Ok(notifications);
    }

    // GET: api/Notifications/unread-count
    [HttpGet("unread-count")]
    public async Task<IActionResult> GetUnreadCount()
    {
        var userId = GetCurrentUserId();

        var count =
            await _notificationService.GetUnreadCountAsync(userId);

        return Ok(new { count });
    }

    // PUT: api/Notifications/{id}/read
    [HttpPut("{id}/read")]
    public async Task<IActionResult> MarkAsRead(int id)
    {
        var userId = GetCurrentUserId();

        var success =
            await _notificationService.MarkAsReadAsync(id, userId);

        if (!success)
            return NotFound();

        return NoContent();
    }

    // PUT: api/Notifications/read-all
    [HttpPut("read-all")]
    public async Task<IActionResult> MarkAllAsRead()
    {
        var userId = GetCurrentUserId();

        await _notificationService.MarkAllAsReadAsync(userId);

        return NoContent();
    }

}