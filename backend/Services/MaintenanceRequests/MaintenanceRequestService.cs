using Microsoft.EntityFrameworkCore;
using PropertyManagement.Api.Data;
using PropertyManagement.Api.DTOs.MaintenanceRequests;
using PropertyManagement.Api.Entities;
using PropertyManagement.Api.Entities.Enums;

namespace PropertyManagement.Api.Services.MaintenanceRequests;

public class MaintenanceRequestService : IMaintenanceRequestService
{
    private readonly ApplicationDbContext _context;

    public MaintenanceRequestService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<MaintenanceRequestResponse>> GetAllAsync()
    {
        return await _context.MaintenanceRequests
            .AsNoTracking()
            .Include(m => m.Property)
            .Include(m => m.Unit)
            .Include(m => m.ReportedByTenant)
            .Include(m => m.ReportedByUser)
            .Include(m => m.AssignedToUser)
            .Select(m => MapToResponse(m))
            .ToListAsync();
    }

    public async Task<MaintenanceRequestResponse?> GetByIdAsync(int id)
    {
        return await _context.MaintenanceRequests
            .AsNoTracking()
            .Include(m => m.Property)
            .Include(m => m.Unit)
            .Include(m => m.ReportedByTenant)
            .Include(m => m.ReportedByUser)
            .Include(m => m.AssignedToUser)
            .Where(m => m.Id == id)
            .Select(m => MapToResponse(m))
            .FirstOrDefaultAsync();
    }

    public async Task<List<MaintenanceRequestResponse>?> GetByPropertyIdAsync(
        int propertyId)
    {
        var propertyExists = await _context.Properties
            .AnyAsync(p => p.Id == propertyId);

        if (!propertyExists)
        {
            return null;
        }

        return await _context.MaintenanceRequests
            .AsNoTracking()
            .Include(m => m.Property)
            .Include(m => m.Unit)
            .Include(m => m.ReportedByTenant)
            .Include(m => m.ReportedByUser)
            .Include(m => m.AssignedToUser)
            .Where(m => m.PropertyId == propertyId)
            .Select(m => MapToResponse(m))
            .ToListAsync();
    }

    public async Task<List<MaintenanceRequestResponse>?> GetByUnitIdAsync(
        int unitId)
    {
        var unitExists = await _context.Units
            .Include(u => u.Building)
            .AnyAsync(u => u.Id == unitId);

        if (!unitExists)
        {
            return null;
        }

        return await _context.MaintenanceRequests
            .AsNoTracking()
            .Include(m => m.Property)
            .Include(m => m.Unit)
            .Include(m => m.ReportedByTenant)
            .Include(m => m.ReportedByUser)
            .Include(m => m.AssignedToUser)
            .Where(m => m.UnitId == unitId)
            .Select(m => MapToResponse(m))
            .ToListAsync();
    }

    public async Task<MaintenanceRequestResponse?> CreateAsync(
        CreateMaintenanceRequestRequest request)
    {
        var propertyExists = await _context.Properties
            .AnyAsync(p => p.Id == request.PropertyId);

        if (!propertyExists)
        {
            return null;
        }

        await ValidateRelationshipsAsync(
            request.PropertyId,
            request.UnitId,
            request.ReportedByTenantId,
            request.ReportedByUserId,
            request.AssignedToUserId);

        ValidateRequest(request.Title, request.Description);

        var maintenanceRequest = new MaintenanceRequest
        {
            PropertyId = request.PropertyId,
            UnitId = request.UnitId,
            ReportedByTenantId = request.ReportedByTenantId,
            ReportedByUserId = request.ReportedByUserId,
            AssignedToUserId = request.AssignedToUserId,
            Title = request.Title.Trim(),
            Description = request.Description.Trim(),
            Priority = request.Priority,
            Status = request.Status,
            ResolutionNotes = string.IsNullOrWhiteSpace(
                request.ResolutionNotes)
                ? null
                : request.ResolutionNotes.Trim(),
            CreatedAtUtc = DateTime.UtcNow,
            ResolvedAtUtc = request.Status == MaintenanceStatus.Resolved
                ? DateTime.UtcNow
                : null
        };

        _context.MaintenanceRequests.Add(maintenanceRequest);
        await _context.SaveChangesAsync();

        return await GetByIdAsync(maintenanceRequest.Id);
    }

    public async Task<MaintenanceRequestResponse?> UpdateAsync(
        int id,
        UpdateMaintenanceRequestRequest request)
    {
        var maintenanceRequest = await _context.MaintenanceRequests
            .FirstOrDefaultAsync(m => m.Id == id);

        if (maintenanceRequest is null)
        {
            return null;
        }

        var propertyExists = await _context.Properties
            .AnyAsync(p => p.Id == request.PropertyId);

        if (!propertyExists)
        {
            throw new InvalidOperationException(
                $"Property with ID {request.PropertyId} was not found.");
        }

        await ValidateRelationshipsAsync(
            request.PropertyId,
            request.UnitId,
            null,
            null,
            request.AssignedToUserId);

        ValidateRequest(request.Title, request.Description);

        maintenanceRequest.PropertyId = request.PropertyId;
        maintenanceRequest.UnitId = request.UnitId;
        maintenanceRequest.AssignedToUserId = request.AssignedToUserId;
        maintenanceRequest.Title = request.Title.Trim();
        maintenanceRequest.Description = request.Description.Trim();
        maintenanceRequest.Priority = request.Priority;
        maintenanceRequest.Status = request.Status;
        maintenanceRequest.ResolutionNotes =
            string.IsNullOrWhiteSpace(request.ResolutionNotes)
                ? null
                : request.ResolutionNotes.Trim();

        if (request.Status == MaintenanceStatus.Resolved &&
            maintenanceRequest.ResolvedAtUtc is null)
        {
            maintenanceRequest.ResolvedAtUtc = DateTime.UtcNow;
        }
        else if (request.Status != MaintenanceStatus.Resolved)
        {
            maintenanceRequest.ResolvedAtUtc = null;
        }

        await _context.SaveChangesAsync();

        return await GetByIdAsync(id);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var maintenanceRequest = await _context.MaintenanceRequests
            .FirstOrDefaultAsync(m => m.Id == id);

        if (maintenanceRequest is null)
        {
            return false;
        }

        _context.MaintenanceRequests.Remove(maintenanceRequest);
        await _context.SaveChangesAsync();

        return true;
    }

    private async Task ValidateRelationshipsAsync(
        int propertyId,
        int? unitId,
        int? reportedByTenantId,
        int? reportedByUserId,
        int? assignedToUserId)
    {
        if (unitId.HasValue)
        {
            var unit = await _context.Units
                .Include(u => u.Building)
                .FirstOrDefaultAsync(u => u.Id == unitId.Value);

            if (unit is null)
            {
                throw new InvalidOperationException(
                    $"Unit with ID {unitId.Value} was not found.");
            }

            if (unit.Building.PropertyId != propertyId)
            {
                throw new InvalidOperationException(
                    "The selected unit does not belong to the selected property.");
            }
        }

        if (reportedByTenantId.HasValue)
        {
            var tenantExists = await _context.Tenants
                .AnyAsync(t => t.Id == reportedByTenantId.Value);

            if (!tenantExists)
            {
                throw new InvalidOperationException(
                    $"Tenant with ID {reportedByTenantId.Value} was not found.");
            }
        }

        if (reportedByUserId.HasValue)
        {
            var userExists = await _context.Users
                .AnyAsync(u => u.Id == reportedByUserId.Value);

            if (!userExists)
            {
                throw new InvalidOperationException(
                    $"User with ID {reportedByUserId.Value} was not found.");
            }
        }

        if (assignedToUserId.HasValue)
        {
            var assignedUserExists = await _context.Users
                .AnyAsync(u => u.Id == assignedToUserId.Value);

            if (!assignedUserExists)
            {
                throw new InvalidOperationException(
                    $"Assigned user with ID {assignedToUserId.Value} was not found.");
            }
        }
    }

    private static void ValidateRequest(
        string title,
        string description)
    {
        if (string.IsNullOrWhiteSpace(title))
        {
            throw new InvalidOperationException(
                "Maintenance request title is required.");
        }

        if (string.IsNullOrWhiteSpace(description))
        {
            throw new InvalidOperationException(
                "Maintenance request description is required.");
        }
    }

    private static MaintenanceRequestResponse MapToResponse(
        MaintenanceRequest m)
    {
        return new MaintenanceRequestResponse
        {
            Id = m.Id,
            PropertyId = m.PropertyId,
            PropertyName = m.Property.Name,
            UnitId = m.UnitId,
            UnitNumber = m.Unit != null
                ? m.Unit.UnitNumber
                : null,
            ReportedByTenantId = m.ReportedByTenantId,
            ReportedByTenantName = m.ReportedByTenant != null
                ? m.ReportedByTenant.FirstName + " " +
                  m.ReportedByTenant.LastName
                : null,
            ReportedByUserId = m.ReportedByUserId,
            ReportedByUserName = m.ReportedByUser != null
                ? m.ReportedByUser.Email
                : null,
            AssignedToUserId = m.AssignedToUserId,
            AssignedToUserName = m.AssignedToUser != null
                ? m.AssignedToUser.Email
                : null,
            Title = m.Title,
            Description = m.Description,
            Priority = m.Priority,
            Status = m.Status,
            ResolutionNotes = m.ResolutionNotes,
            CreatedAtUtc = m.CreatedAtUtc,
            ResolvedAtUtc = m.ResolvedAtUtc
        };
    }
}