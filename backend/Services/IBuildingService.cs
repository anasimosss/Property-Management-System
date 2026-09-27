using PropertyManagement.Api.DTOs.Buildings;

namespace PropertyManagement.Api.Services;


public interface IBuildingService
{
    Task<IReadOnlyList<BuildingResponse>> GetAllAsync();
    Task<BuildingResponse?> GetByIdAsync(int id);
    Task<IReadOnlyList<BuildingResponse>?> GetByPropertyIdAsync(int propertyId);
    Task<BuildingResponse> CreateAsync(CreateBuildingRequest request);
    Task<BuildingResponse?> UpdateAsync(int id, UpdateBuildingRequest request);
    Task<IReadOnlyList<BuildingResponse>> GetByUserIdAsync(int userId);

    /// <summary>
    /// Attempts to delete the building.
    /// Returns (true, null) on success.
    /// Returns (false, conflictMessage) when dependents block deletion.
    /// Returns (false, null) when the building was not found.
    /// </summary>
    Task<(bool found, bool deleted, string? conflictReason)> DeleteAsync(int id);
}
