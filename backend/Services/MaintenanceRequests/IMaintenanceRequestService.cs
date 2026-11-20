using PropertyManagement.Api.DTOs.MaintenanceRequests;
using PropertyManagement.Api.Entities.Enums;

namespace PropertyManagement.Api.Services.MaintenanceRequests;

public interface IMaintenanceRequestService
{
    Task<List<MaintenanceRequestResponse>> GetAllAsync();
    Task<MaintenanceRequestResponse?> GetByIdAsync(int id);
    Task<List<MaintenanceRequestResponse>?> GetByPropertyIdAsync(int propertyId);
    Task<List<MaintenanceRequestResponse>?> GetByUnitIdAsync(int unitId);

    Task<MaintenanceRequestResponse?> CreateAsync(
        CreateMaintenanceRequestRequest request);

    Task<MaintenanceRequestResponse?> CreateForTenantAsync(
        int userId,
        string title,
        string description,
        MaintenancePriority priority);

    Task<MaintenanceRequestResponse?> UpdateAsync(
        int id,
        UpdateMaintenanceRequestRequest request);

    Task<bool> DeleteAsync(int id);
}