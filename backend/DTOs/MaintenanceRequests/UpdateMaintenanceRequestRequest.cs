namespace PropertyManagement.Api.DTOs.MaintenanceRequests;

using PropertyManagement.Api.Entities.Enums;

public class UpdateMaintenanceRequestRequest
{
    public int PropertyId { get; set; }
    public int? UnitId { get; set; }
    public int? AssignedToUserId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public MaintenancePriority Priority { get; set; }
    public MaintenanceStatus Status { get; set; }
    public string? ResolutionNotes { get; set; }
}