using Microsoft.EntityFrameworkCore;
using PropertyManagement.Api.Data;
using PropertyManagement.Api.DTOs.UnitRequests;
using PropertyManagement.Api.Entities;
using PropertyManagement.Api.Entities.Enums;

namespace PropertyManagement.Api.Services.UnitRequests;

public class UnitRequestService : IUnitRequestService
{
    private readonly ApplicationDbContext _context;

    public UnitRequestService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<UnitRequestResponse?> CreateAsync(
        int userId,
        CreateUnitRequestRequest request)
    {
        var tenant = await _context.Tenants
            .FirstOrDefaultAsync(t => t.UserId == userId);

        if (tenant is null)
        {
            throw new InvalidOperationException(
                "The authenticated user is not associated with a tenant.");
        }

        var unit = await _context.Units
            .Include(u => u.Building)
            .FirstOrDefaultAsync(u => u.Id == request.UnitId);

        if (unit is null)
        {
            return null;
        }

        var hasActiveLease = await _context.Leases
            .AnyAsync(l =>
                l.TenantId == tenant.Id &&
                l.Status == LeaseStatus.Active);

        if (hasActiveLease)
        {
            throw new InvalidOperationException(
                "You already have an active lease and cannot request another unit.");
        }

        if (unit.Status != UnitStatus.Vacant)
        {
            throw new InvalidOperationException(
                "This unit is not currently available.");
        }

        var existingPendingRequest =
            await _context.UnitRequests
                .AnyAsync(r =>
                    r.TenantId == tenant.Id &&
                    r.UnitId == request.UnitId &&
                    r.Status == UnitRequestStatus.Pending);

        if (existingPendingRequest)
        {
            throw new InvalidOperationException(
                "You already have a pending request for this unit.");
        }

        var unitRequest = new UnitRequest
        {
            TenantId = tenant.Id,
            UnitId = unit.Id,
            Status = UnitRequestStatus.Pending,
            Message = string.IsNullOrWhiteSpace(request.Message)
                ? null
                : request.Message.Trim(),
            CreatedAtUtc = DateTime.UtcNow
        };

        _context.UnitRequests.Add(unitRequest);

        await _context.SaveChangesAsync();

        return await GetResponseAsync(unitRequest.Id);
    }

    public async Task<List<UnitRequestResponse>> GetMyRequestsAsync(
        int userId)
    {
        var tenant = await _context.Tenants
            .AsNoTracking()
            .FirstOrDefaultAsync(t => t.UserId == userId);

        if (tenant is null)
        {
            return new List<UnitRequestResponse>();
        }

        return await _context.UnitRequests
            .AsNoTracking()
            .Where(r => r.TenantId == tenant.Id)
            .OrderByDescending(r => r.CreatedAtUtc)
            .Select(r => new UnitRequestResponse
            {
                Id = r.Id,
                TenantId = r.TenantId,
                TenantName =
                    r.Tenant.FirstName + " " + r.Tenant.LastName,
                TenantEmail = r.Tenant.Email,
                UnitId = r.UnitId,
                UnitNumber = r.Unit.UnitNumber,
                BuildingName = r.Unit.Building.Name,
                TargetRent = r.Unit.TargetRent,
                Status = r.Status,
                Message = r.Message,
                RejectionReason = r.RejectionReason,
                CreatedAtUtc = r.CreatedAtUtc,
                ReviewedAtUtc = r.ReviewedAtUtc,
                ReviewedByName =
                    r.ReviewedByUser == null
                        ? null
                        : r.ReviewedByUser.FirstName +
                          " " +
                          r.ReviewedByUser.LastName
            })
            .ToListAsync();
    }

    public async Task<List<UnitRequestResponse>> GetAllAsync()
    {
        return await _context.UnitRequests
            .AsNoTracking()
            .OrderByDescending(r => r.CreatedAtUtc)
            .Select(r => new UnitRequestResponse
            {
                Id = r.Id,
                TenantId = r.TenantId,
                TenantName =
                    r.Tenant.FirstName + " " + r.Tenant.LastName,
                TenantEmail = r.Tenant.Email,
                UnitId = r.UnitId,
                UnitNumber = r.Unit.UnitNumber,
                BuildingName = r.Unit.Building.Name,
                TargetRent = r.Unit.TargetRent,
                Status = r.Status,
                Message = r.Message,
                RejectionReason = r.RejectionReason,
                CreatedAtUtc = r.CreatedAtUtc,
                ReviewedAtUtc = r.ReviewedAtUtc,
                ReviewedByName =
                    r.ReviewedByUser == null
                        ? null
                        : r.ReviewedByUser.FirstName +
                          " " +
                          r.ReviewedByUser.LastName
            })
            .ToListAsync();
    }

   public async Task<UnitRequestResponse?> ApproveAsync(
    int requestId,
    int reviewedByUserId)
{
    var request = await _context.UnitRequests
        .FirstOrDefaultAsync(r => r.Id == requestId);

    if (request is null)
    {
        return null;
    }

    if (request.Status != UnitRequestStatus.Pending)
    {
        throw new InvalidOperationException(
            "Only pending unit requests can be approved.");
    }

    var unit = await _context.Units
        .FirstOrDefaultAsync(u => u.Id == request.UnitId);

    if (unit is null)
    {
        throw new InvalidOperationException(
            "The requested unit no longer exists.");
    }

    if (unit.Status != UnitStatus.Vacant)
    {
        throw new InvalidOperationException(
            "This unit is no longer available.");
    }

    var now = DateTime.UtcNow;

    // Approve the selected request.
    request.Status = UnitRequestStatus.Approved;
    request.ReviewedAtUtc = now;
    request.ReviewedByUserId = reviewedByUserId;

    // Reject all other pending requests for the same unit.
    var otherPendingRequests = await _context.UnitRequests
        .Where(r =>
            r.UnitId == request.UnitId &&
            r.Id != request.Id &&
            r.Status == UnitRequestStatus.Pending)
        .ToListAsync();

    foreach (var otherRequest in otherPendingRequests)
    {
        otherRequest.Status = UnitRequestStatus.Rejected;
        otherRequest.ReviewedAtUtc = now;
        otherRequest.ReviewedByUserId = reviewedByUserId;
        otherRequest.RejectionReason =
            "This unit has been allocated to another tenant.";
    }

    await _context.SaveChangesAsync();

    return await GetResponseAsync(request.Id);
}

    public async Task<UnitRequestResponse?> RejectAsync(
        int requestId,
        int reviewedByUserId,
        string? rejectionReason)
    {
        var request = await _context.UnitRequests
            .FirstOrDefaultAsync(r => r.Id == requestId);

        if (request is null)
        {
            return null;
        }

        if (request.Status != UnitRequestStatus.Pending)
        {
            throw new InvalidOperationException(
                "Only pending unit requests can be rejected.");
        }

        request.Status = UnitRequestStatus.Rejected;
        request.ReviewedAtUtc = DateTime.UtcNow;
        request.ReviewedByUserId = reviewedByUserId;
        request.RejectionReason =
            string.IsNullOrWhiteSpace(rejectionReason)
                ? null
                : rejectionReason.Trim();

        await _context.SaveChangesAsync();

        return await GetResponseAsync(request.Id);
    }

    private async Task<UnitRequestResponse?> GetResponseAsync(
        int requestId)
    {
        return await _context.UnitRequests
            .AsNoTracking()
            .Where(r => r.Id == requestId)
            .Select(r => new UnitRequestResponse
            {
                Id = r.Id,
                TenantId = r.TenantId,
                TenantName =
                    r.Tenant.FirstName + " " + r.Tenant.LastName,
                TenantEmail = r.Tenant.Email,
                UnitId = r.UnitId,
                UnitNumber = r.Unit.UnitNumber,
                BuildingName = r.Unit.Building.Name,
                TargetRent = r.Unit.TargetRent,
                Status = r.Status,
                Message = r.Message,
                RejectionReason = r.RejectionReason,
                CreatedAtUtc = r.CreatedAtUtc,
                ReviewedAtUtc = r.ReviewedAtUtc,
                ReviewedByName =
                    r.ReviewedByUser == null
                        ? null
                        : r.ReviewedByUser.FirstName +
                          " " +
                          r.ReviewedByUser.LastName
            })
            .FirstOrDefaultAsync();
    }
}