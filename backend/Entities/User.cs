namespace PropertyManagement.Api.Entities;

using PropertyManagement.Api.Entities.Enums;

public class User
{
    public int Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
    public UserRole Role { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAtUtc { get; set; }

    // Navigation properties
    public Tenant? Tenant { get; set; }
    public ICollection<Expense> RecordedExpenses { get; set; } = new List<Expense>();
    public ICollection<MaintenanceRequest> ReportedMaintenanceRequests { get; set; } = new List<MaintenanceRequest>();
    public ICollection<MaintenanceRequest> AssignedMaintenanceRequests { get; set; } = new List<MaintenanceRequest>();
}
