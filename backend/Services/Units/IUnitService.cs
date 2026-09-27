using PropertyManagement.Api.DTOs.Units;

namespace PropertyManagement.Api.Services.Units;

public interface IUnitService
{
    Task<List<UnitResponse>> GetAllAsync();
    Task<UnitResponse?> GetByIdAsync(int id);
    Task<List<UnitResponse>?> GetByBuildingIdAsync(int buildingId);
    Task<UnitResponse?> CreateAsync(CreateUnitRequest request);
    Task<UnitResponse?> UpdateAsync(int id, UpdateUnitRequest request);
    Task<List<UnitResponse>> GetByUserIdAsync(int userId);
    Task<bool> DeleteAsync(int id);
    Task<List<AvailableUnitResponse>> GetAvailableUnitsAsync();

    bool LastDeleteHadDependencies { get; }
}