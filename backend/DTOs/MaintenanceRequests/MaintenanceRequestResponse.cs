namespace PropertyManagement.Api.DTOs.MaintenanceRequests;

using PropertyManagement.Api.Entities.Enums;

public class MaintenanceRequestResponse
{
    public int Id { get; set; }
    public int PropertyId { get; set; }
    public string PropertyName { get; set; } = string.Empty;
    public int? UnitId { get; set; }
    public string? UnitNumber { get; set; }

    public int? ReportedByTenantId { get; set; }
    public string? ReportedByTenantName { get; set; }

    public int? ReportedByUserId { get; set; }
    public string? ReportedByUserName { get; set; }

    public int? AssignedToUserId { get; set; }
    public string? AssignedToUserName { get; set; }

    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public MaintenancePriority Priority { get; set; }
    public MaintenanceStatus Status { get; set; }
    public string? ResolutionNotes { get; set; }
    public DateTime CreatedAtUtc { get; set; }
    public DateTime? ResolvedAtUtc { get; set; }
}