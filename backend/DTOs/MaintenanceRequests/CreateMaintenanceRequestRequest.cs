namespace PropertyManagement.Api.DTOs.MaintenanceRequests;

using PropertyManagement.Api.Entities.Enums;

public class CreateMaintenanceRequestRequest
{
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
}