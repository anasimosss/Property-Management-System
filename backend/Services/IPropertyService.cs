using PropertyManagement.Api.DTOs.Properties;

namespace PropertyManagement.Api.Services;

public interface IPropertyService
{
    Task<IReadOnlyList<PropertyResponse>> GetAllAsync();
    Task<PropertyResponse?> GetByIdAsync(int id);
    Task<PropertyResponse> CreateAsync(CreatePropertyRequest request);
    Task<PropertyResponse?> UpdateAsync(int id, UpdatePropertyRequest request);
    Task<IReadOnlyList<PropertyResponse>> GetByUserIdAsync(int userId);

    /// <summary>
    /// Attempts to delete the property.
    /// Returns (true, null) on success.
    /// Returns (false, conflictMessage) when dependents block deletion.
    /// Returns (false, null) when the property was not found.
    /// </summary>
    Task<(bool found, bool deleted, string? conflictReason)> DeleteAsync(int id);
}
