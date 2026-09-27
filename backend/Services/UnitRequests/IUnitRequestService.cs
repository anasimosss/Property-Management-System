using PropertyManagement.Api.DTOs.UnitRequests;

namespace PropertyManagement.Api.Services.UnitRequests;

public interface IUnitRequestService
{
    Task<UnitRequestResponse?> CreateAsync(
        int userId,
        CreateUnitRequestRequest request);

    Task<List<UnitRequestResponse>> GetMyRequestsAsync(
        int userId);

    Task<List<UnitRequestResponse>> GetAllAsync();

    Task<UnitRequestResponse?> ApproveAsync(
        int requestId,
        int reviewedByUserId);

    Task<UnitRequestResponse?> RejectAsync(
        int requestId,
        int reviewedByUserId,
        string? rejectionReason);
}