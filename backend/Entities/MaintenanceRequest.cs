namespace PropertyManagement.Api.Entities;

using PropertyManagement.Api.Entities.Enums;

public class MaintenanceRequest
{
    public int Id { get; set; }
    public int PropertyId { get; set; }
    public int? UnitId { get; set; }
    public int? ReportedByTenantId { get; set; }
    public int? ReportedByUserId { get; set; }
    public int? AssignedToUserId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public MaintenancePriority Priority { get; set; } = MaintenancePriority.Medium;
    public MaintenanceStatus Status { get; set; } = MaintenanceStatus.Open;
    public string? ResolutionNotes { get; set; }
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
    public DateTime? ResolvedAtUtc { get; set; }

    // Navigation properties
    public Property Property { get; set; } = null!;
    public Unit? Unit { get; set; }
    public Tenant? ReportedByTenant { get; set; }
    public User? ReportedByUser { get; set; }
    public User? AssignedToUser { get; set; }
}
