using PropertyManagement.Api.Entities.Enums;

namespace PropertyManagement.Api.DTOs.MaintenanceRequests;

public class CreateTenantMaintenanceRequestRequest
{
    public string Title { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public MaintenancePriority Priority { get; set; }
        = MaintenancePriority.Medium;
}