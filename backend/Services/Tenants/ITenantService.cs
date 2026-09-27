using PropertyManagement.Api.DTOs.Tenants;

namespace PropertyManagement.Api.Services.Tenants;

public interface ITenantService
{
    Task<List<TenantResponse>> GetAllAsync();

    Task<TenantResponse?> GetByIdAsync(int id);

    Task<TenantResponse?> GetByUserIdAsync(int userId);

    Task<TenantResponse?> CreateAsync(CreateTenantRequest request);

    Task<TenantResponse?> UpdateAsync(
        int id,
        UpdateTenantRequest request);

    Task<bool> DeleteAsync(int id);

    bool LastDeleteHadDependencies { get; }
}