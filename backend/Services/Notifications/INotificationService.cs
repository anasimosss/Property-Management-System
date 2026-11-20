using PropertyManagement.Api.Entities;

namespace PropertyManagement.Api.Services.Notifications;

public interface INotificationService
{
    Task<List<Notification>> GetMyNotificationsAsync(int userId);

    Task<int> GetUnreadCountAsync(int userId);

    Task<bool> MarkAsReadAsync(int notificationId, int userId);

    Task MarkAllAsReadAsync(int userId);

    Task CreateAsync(
        int userId,
        string title,
        string message,
        string type);

    Task<bool> CreateOnceAsync(
        int userId,
        string title,
        string message,
        string type,
        string notificationKey);
}