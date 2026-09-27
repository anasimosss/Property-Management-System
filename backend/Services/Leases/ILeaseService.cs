using PropertyManagement.Api.DTOs.Leases;

namespace PropertyManagement.Api.Services.Leases;

public interface ILeaseService
{
    Task<List<LeaseResponse>> GetAllAsync();
    Task<LeaseResponse?> GetByIdAsync(int id);
    Task<List<LeaseResponse>?> GetByUnitIdAsync(int unitId);
    Task<List<LeaseResponse>?> GetByTenantIdAsync(int tenantId);
    Task<List<LeaseResponse>> GetByUserIdAsync(int userId);
    Task<LeaseResponse?> CreateAsync(CreateLeaseRequest request);
    Task<LeaseResponse?> UpdateAsync(int id, UpdateLeaseRequest request);
    Task<bool> DeleteAsync(int id);

    bool LastDeleteHadPayments { get; }
}