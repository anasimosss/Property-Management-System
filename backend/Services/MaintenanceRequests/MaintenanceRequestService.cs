using Microsoft.EntityFrameworkCore;
using PropertyManagement.Api.Data;
using PropertyManagement.Api.DTOs.MaintenanceRequests;
using PropertyManagement.Api.Entities;
using PropertyManagement.Api.Entities.Enums;
using PropertyManagement.Api.Services.Notifications;
using System.Security.Claims;

namespace PropertyManagement.Api.Services.MaintenanceRequests;

public class MaintenanceRequestService(
    ApplicationDbContext context,
    IHttpContextAccessor httpContextAccessor,
    INotificationService notificationService) : IMaintenanceRequestService
{
    private readonly ApplicationDbContext _context = context;
    private readonly IHttpContextAccessor _httpContextAccessor =
        httpContextAccessor;
    private readonly INotificationService _notificationService =
        notificationService;

    // =========================================================
    // GET ALL MAINTENANCE REQUESTS
    // =========================================================
    public async Task<List<MaintenanceRequestResponse>> GetAllAsync()
    {
        var query = _context.MaintenanceRequests
            .AsNoTracking()
            .Include(m => m.Property)
            .Include(m => m.Unit)
            .Include(m => m.ReportedByTenant)
            .Include(m => m.ReportedByUser)
            .Include(m => m.AssignedToUser)
            .AsQueryable();

        // Tenant can only see maintenance requests
        // reported by their own tenant profile.
        if (IsTenant())
        {
            var userId = GetCurrentUserId();

            if (userId is null)
            {
                return new List<MaintenanceRequestResponse>();
            }

            query = query.Where(
                m => m.ReportedByTenant != null &&
                     m.ReportedByTenant.UserId == userId.Value);
        }

        return await query
            .OrderByDescending(m => m.CreatedAtUtc)
            .Select(m => MapToResponse(m))
            .ToListAsync();
    }

    // =========================================================
    // GET MAINTENANCE REQUEST BY ID
    // =========================================================
    public async Task<MaintenanceRequestResponse?> GetByIdAsync(
        int id)
    {
        var query = _context.MaintenanceRequests
            .AsNoTracking()
            .Include(m => m.Property)
            .Include(m => m.Unit)
            .Include(m => m.ReportedByTenant)
            .Include(m => m.ReportedByUser)
            .Include(m => m.AssignedToUser)
            .Where(m => m.Id == id);

        // Tenant can only access their own request.
        if (IsTenant())
        {
            var userId = GetCurrentUserId();

            if (userId is null)
            {
                return null;
            }

            query = query.Where(
                m => m.ReportedByTenant != null &&
                     m.ReportedByTenant.UserId == userId.Value);
        }

        return await query
            .Select(m => MapToResponse(m))
            .FirstOrDefaultAsync();
    }

    // =========================================================
    // GET MAINTENANCE REQUESTS BY PROPERTY
    // =========================================================
    public async Task<List<MaintenanceRequestResponse>?>
        GetByPropertyIdAsync(int propertyId)
    {
        var propertyExists = await _context.Properties
            .AnyAsync(p => p.Id == propertyId);

        if (!propertyExists)
        {
            return null;
        }

        var query = _context.MaintenanceRequests
            .AsNoTracking()
            .Include(m => m.Property)
            .Include(m => m.Unit)
            .Include(m => m.ReportedByTenant)
            .Include(m => m.ReportedByUser)
            .Include(m => m.AssignedToUser)
            .Where(m => m.PropertyId == propertyId);

        // Tenant must not be able to browse
        // another tenant's property maintenance history.
        if (IsTenant())
        {
            var userId = GetCurrentUserId();

            if (userId is null)
            {
                return new List<MaintenanceRequestResponse>();
            }

            query = query.Where(
                m => m.ReportedByTenant != null &&
                     m.ReportedByTenant.UserId == userId.Value);
        }

        return await query
            .OrderByDescending(m => m.CreatedAtUtc)
            .Select(m => MapToResponse(m))
            .ToListAsync();
    }

    // =========================================================
    // GET MAINTENANCE REQUESTS BY UNIT
    // =========================================================
    public async Task<List<MaintenanceRequestResponse>?>
        GetByUnitIdAsync(int unitId)
    {
        var unitExists = await _context.Units
            .Include(u => u.Building)
            .AnyAsync(u => u.Id == unitId);

        if (!unitExists)
        {
            return null;
        }

        var query = _context.MaintenanceRequests
            .AsNoTracking()
            .Include(m => m.Property)
            .Include(m => m.Unit)
            .Include(m => m.ReportedByTenant)
            .Include(m => m.ReportedByUser)
            .Include(m => m.AssignedToUser)
            .Where(m => m.UnitId == unitId);

        // Tenant can only see requests from their own unit.
        if (IsTenant())
        {
            var userId = GetCurrentUserId();

            if (userId is null)
            {
                return new List<MaintenanceRequestResponse>();
            }

            query = query.Where(
                m => m.ReportedByTenant != null &&
                     m.ReportedByTenant.UserId == userId.Value);
        }

        return await query
            .OrderByDescending(m => m.CreatedAtUtc)
            .Select(m => MapToResponse(m))
            .ToListAsync();
    }

    // =========================================================
    // CREATE MAINTENANCE REQUEST
    // =========================================================
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

        ValidateRequest(
            request.Title,
            request.Description);

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
            ResolutionNotes =
                string.IsNullOrWhiteSpace(request.ResolutionNotes)
                    ? null
                    : request.ResolutionNotes.Trim(),
            CreatedAtUtc = DateTime.UtcNow,
            ResolvedAtUtc =
                request.Status == MaintenanceStatus.Resolved
                    ? DateTime.UtcNow
                    : null
        };

        _context.MaintenanceRequests.Add(
            maintenanceRequest);

        await _context.SaveChangesAsync();

        await NotifyMaintenanceTenantAsync(
            maintenanceRequest.ReportedByTenantId,
            maintenanceRequest.UnitId,
            "Maintenance Request Received",
            maintenanceRequest.AssignedToUserId.HasValue
                ? $"Your request '{maintenanceRequest.Title}' was received and assigned to a staff member."
                : $"Your request '{maintenanceRequest.Title}' was received.",
            $"maintenance:{maintenanceRequest.Id}:received");

        await NotifyMaintenanceRequestCreatedAsync(
            maintenanceRequest);

        return await GetByIdAsync(
            maintenanceRequest.Id);
    }

    // =========================================================
    // CREATE MAINTENANCE REQUEST FOR TENANT
    // =========================================================
    public async Task<MaintenanceRequestResponse?>
        CreateForTenantAsync(
            int userId,
            string title,
            string description,
            MaintenancePriority priority)
    {
        var tenant = await _context.Tenants
            .FirstOrDefaultAsync(
                t => t.UserId == userId);

        if (tenant is null)
        {
            throw new InvalidOperationException(
                "No tenant profile is associated with your account.");
        }

        var activeLease = await _context.Leases
            .Include(l => l.Unit)
                .ThenInclude(u => u.Building)
            .FirstOrDefaultAsync(l =>
                l.TenantId == tenant.Id &&
                l.Status == LeaseStatus.Active &&
                l.Unit != null);

        if (activeLease is null)
        {
            throw new InvalidOperationException(
                "You do not have an active lease.");
        }

        ValidateRequest(
            title,
            description);

        var maintenanceRequest = new MaintenanceRequest
        {
            PropertyId =
                activeLease.Unit!.Building.PropertyId,

            UnitId = activeLease.UnitId,

            ReportedByTenantId = tenant.Id,

            ReportedByUserId = null,

            AssignedToUserId = null,

            Title = title.Trim(),

            Description = description.Trim(),

            Priority = priority,

            Status = MaintenanceStatus.Open,

            ResolutionNotes = null,

            CreatedAtUtc = DateTime.UtcNow,

            ResolvedAtUtc = null
        };

        _context.MaintenanceRequests.Add(
            maintenanceRequest);

        await _context.SaveChangesAsync();

        await NotifyMaintenanceTenantAsync(
            tenant.Id,
            maintenanceRequest.UnitId,
            "Maintenance Request Received",
            $"Your request '{maintenanceRequest.Title}' was received.",
            $"maintenance:{maintenanceRequest.Id}:received");

        await NotifyMaintenanceRequestCreatedAsync(
            maintenanceRequest);

        return await GetByIdAsync(
            maintenanceRequest.Id);
    }

    // =========================================================
    // UPDATE MAINTENANCE REQUEST
    // =========================================================
    public async Task<MaintenanceRequestResponse?>
        UpdateAsync(
            int id,
            UpdateMaintenanceRequestRequest request)
    {
        var maintenanceRequest =
            await _context.MaintenanceRequests
                .FirstOrDefaultAsync(
                    m => m.Id == id);

        if (maintenanceRequest is null)
        {
            return null;
        }

        var propertyExists =
            await _context.Properties
                .AnyAsync(
                    p => p.Id == request.PropertyId);

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

        ValidateRequest(
            request.Title,
            request.Description);

        var previousStatus = maintenanceRequest.Status;
        var previousAssigneeId = maintenanceRequest.AssignedToUserId;

        maintenanceRequest.PropertyId =
            request.PropertyId;

        maintenanceRequest.UnitId =
            request.UnitId;

        maintenanceRequest.AssignedToUserId =
            request.AssignedToUserId;

        maintenanceRequest.Title =
            request.Title.Trim();

        maintenanceRequest.Description =
            request.Description.Trim();

        maintenanceRequest.Priority =
            request.Priority;

        maintenanceRequest.Status =
            request.Status;

        maintenanceRequest.ResolutionNotes =
            string.IsNullOrWhiteSpace(
                request.ResolutionNotes)
                ? null
                : request.ResolutionNotes.Trim();

        if (request.Status ==
                MaintenanceStatus.Resolved &&
            maintenanceRequest.ResolvedAtUtc is null)
        {
            maintenanceRequest.ResolvedAtUtc =
                DateTime.UtcNow;
        }
        else if (
            request.Status !=
            MaintenanceStatus.Resolved)
        {
            maintenanceRequest.ResolvedAtUtc =
                null;
        }

        await _context.SaveChangesAsync();

        if (maintenanceRequest.Status != previousStatus)
        {
            var statusMessage = maintenanceRequest.Status switch
            {
                MaintenanceStatus.Assigned =>
                    maintenanceRequest.AssignedToUserId.HasValue
                        ? "A staff member has been assigned to your request."
                        : "Your request status changed to Assigned.",
                MaintenanceStatus.InProgress =>
                    "Work has started on your maintenance request.",
                MaintenanceStatus.OnHold =>
                    "Work on your maintenance request is temporarily on hold.",
                MaintenanceStatus.Resolved =>
                    string.IsNullOrWhiteSpace(maintenanceRequest.ResolutionNotes)
                        ? "Your maintenance request has been completed."
                        : $"Your maintenance request has been completed. {maintenanceRequest.ResolutionNotes}",
                MaintenanceStatus.Cancelled =>
                    "Your maintenance request has been cancelled.",
                _ =>
                    "Your maintenance request has been reopened."
            };

            var statusTitle = maintenanceRequest.Status switch
            {
                MaintenanceStatus.Assigned => "Maintenance Request Assigned",
                MaintenanceStatus.InProgress => "Maintenance Work Started",
                MaintenanceStatus.OnHold => "Maintenance Request On Hold",
                MaintenanceStatus.Resolved => "Maintenance Request Completed",
                MaintenanceStatus.Cancelled => "Maintenance Request Cancelled",
                _ => "Maintenance Request Reopened"
            };

            await NotifyMaintenanceTenantAsync(
                maintenanceRequest.ReportedByTenantId,
                maintenanceRequest.UnitId,
                statusTitle,
                $"{statusMessage} Request: '{maintenanceRequest.Title}'.",
                $"maintenance:{maintenanceRequest.Id}:status:{maintenanceRequest.Status}");
        }
        else if (maintenanceRequest.AssignedToUserId.HasValue &&
                 maintenanceRequest.AssignedToUserId != previousAssigneeId)
        {
            await NotifyMaintenanceTenantAsync(
                maintenanceRequest.ReportedByTenantId,
                maintenanceRequest.UnitId,
                "Maintenance Request Assigned",
                $"A staff member has been assigned to your request '{maintenanceRequest.Title}'.",
                $"maintenance:{maintenanceRequest.Id}:assigned:{maintenanceRequest.AssignedToUserId}");
        }

        return await GetByIdAsync(id);
    }

    // =========================================================
    // DELETE MAINTENANCE REQUEST
    // =========================================================
    public async Task<bool> DeleteAsync(int id)
    {
        var maintenanceRequest =
            await _context.MaintenanceRequests
                .FirstOrDefaultAsync(
                    m => m.Id == id);

        if (maintenanceRequest is null)
        {
            return false;
        }

        _context.MaintenanceRequests.Remove(
            maintenanceRequest);

        await _context.SaveChangesAsync();

        return true;
    }

    private async Task NotifyMaintenanceTenantAsync(
        int? tenantId,
        int? unitId,
        string title,
        string message,
        string notificationKey)
    {
        if (!tenantId.HasValue)
        {
            return;
        }

        var userId = await _context.Tenants
            .Where(t => t.Id == tenantId.Value)
            .Select(t => t.UserId)
            .FirstOrDefaultAsync();

        if (!userId.HasValue)
        {
            return;
        }

        var unitNumber = unitId.HasValue
            ? await _context.Units
                .Where(u => u.Id == unitId.Value)
                .Select(u => u.UnitNumber)
                .FirstOrDefaultAsync()
            : null;

        if (!string.IsNullOrWhiteSpace(unitNumber))
        {
            message = $"Unit {unitNumber}. {message}";
        }

        await _notificationService.CreateOnceAsync(
            userId.Value,
            title,
            message,
            "Maintenance",
            notificationKey);
    }

    private async Task NotifyMaintenanceRequestCreatedAsync(
        MaintenanceRequest request)
    {
        var unitNumber = request.UnitId.HasValue
            ? await _context.Units
                .AsNoTracking()
                .Where(u => u.Id == request.UnitId.Value)
                .Select(u => u.UnitNumber)
                .FirstOrDefaultAsync()
            : null;

        var propertyName = await _context.Properties
            .AsNoTracking()
            .Where(p => p.Id == request.PropertyId)
            .Select(p => p.Name)
            .FirstOrDefaultAsync();

        var reportedByTenantName = request.ReportedByTenantId.HasValue
            ? await _context.Tenants
                .AsNoTracking()
                .Where(t => t.Id == request.ReportedByTenantId.Value)
                .Select(t => t.FirstName + " " + t.LastName)
                .FirstOrDefaultAsync()
            : null;

        var reportedByUserName = request.ReportedByUserId.HasValue
            ? await _context.Users
                .AsNoTracking()
                .Where(u => u.Id == request.ReportedByUserId.Value)
                .Select(u => u.FirstName + " " + u.LastName)
                .FirstOrDefaultAsync()
            : null;

        var reporterName =
            !string.IsNullOrWhiteSpace(reportedByTenantName)
                ? reportedByTenantName
                : !string.IsNullOrWhiteSpace(reportedByUserName)
                    ? reportedByUserName
                    : "A tenant";

        var propertyText = string.IsNullOrWhiteSpace(propertyName)
            ? string.Empty
            : $" at {propertyName}";

        var unitText = string.IsNullOrWhiteSpace(unitNumber)
            ? "the property"
            : $"Unit {unitNumber}";

        var maintenanceMessage =
            $"New maintenance request from {reporterName} for {unitText}{propertyText}: {request.Title}.";

        var staffUserIds = request.AssignedToUserId.HasValue
            ? new List<int> { request.AssignedToUserId.Value }
            : await _context.Users
                .AsNoTracking()
                .Where(u => u.Role == UserRole.MaintenanceStaff && u.IsActive)
                .Select(u => u.Id)
                .ToListAsync();

        foreach (var staffUserId in staffUserIds.Distinct())
        {
            await _notificationService.CreateOnceAsync(
                staffUserId,
                "New Maintenance Request",
                maintenanceMessage,
                "Maintenance",
                $"maintenance:{request.Id}:new:{staffUserId}");
        }

        var adminUserIds = await _context.Users
            .AsNoTracking()
            .Where(u => u.Role == UserRole.Admin && u.IsActive)
            .Select(u => u.Id)
            .ToListAsync();

        foreach (var adminUserId in adminUserIds)
        {
            await _notificationService.CreateOnceAsync(
                adminUserId,
                "New Maintenance Request",
                maintenanceMessage,
                "Maintenance",
                $"maintenance:{request.Id}:admin:{adminUserId}");
        }

        var propertyManagerUserIds = await _context.Users
            .AsNoTracking()
            .Where(u => u.Role == UserRole.PropertyManager && u.IsActive)
            .Select(u => u.Id)
            .ToListAsync();

        foreach (var propertyManagerUserId in propertyManagerUserIds)
        {
            await _notificationService.CreateOnceAsync(
                propertyManagerUserId,
                "New Maintenance Request",
                maintenanceMessage,
                "Maintenance",
                $"maintenance:{request.Id}:property-manager:{propertyManagerUserId}");
        }
    }

    // =========================================================
    // VALIDATE RELATIONSHIPS
    // =========================================================
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
                .FirstOrDefaultAsync(
                    u => u.Id == unitId.Value);

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
            var tenantExists =
                await _context.Tenants
                    .AnyAsync(
                        t => t.Id ==
                             reportedByTenantId.Value);

            if (!tenantExists)
            {
                throw new InvalidOperationException(
                    $"Tenant with ID {reportedByTenantId.Value} was not found.");
            }
        }

        if (reportedByUserId.HasValue)
        {
            var userExists =
                await _context.Users
                    .AnyAsync(
                        u => u.Id ==
                             reportedByUserId.Value);

            if (!userExists)
            {
                throw new InvalidOperationException(
                    $"User with ID {reportedByUserId.Value} was not found.");
            }
        }

        if (assignedToUserId.HasValue)
        {
            var assignedUserExists =
                await _context.Users
                    .AnyAsync(
                        u => u.Id ==
                             assignedToUserId.Value);

            if (!assignedUserExists)
            {
                throw new InvalidOperationException(
                    $"Assigned user with ID {assignedToUserId.Value} was not found.");
            }
        }
    }

    // =========================================================
    // VALIDATE REQUEST
    // =========================================================
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

    // =========================================================
    // MAP RESPONSE
    // =========================================================
    private static MaintenanceRequestResponse
        MapToResponse(MaintenanceRequest m)
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

            ReportedByTenantId =
                m.ReportedByTenantId,

            ReportedByTenantName =
                m.ReportedByTenant != null
                    ? m.ReportedByTenant.FirstName +
                      " " +
                      m.ReportedByTenant.LastName
                    : null,

            ReportedByUserId =
                m.ReportedByUserId,

            ReportedByUserName =
                m.ReportedByUser != null
                    ? m.ReportedByUser.Email
                    : null,

            AssignedToUserId =
                m.AssignedToUserId,

            AssignedToUserName =
                m.AssignedToUser != null
                    ? m.AssignedToUser.Email
                    : null,

            Title = m.Title,

            Description = m.Description,

            Priority = m.Priority,

            Status = m.Status,

            ResolutionNotes =
                m.ResolutionNotes,

            CreatedAtUtc =
                m.CreatedAtUtc,

            ResolvedAtUtc =
                m.ResolvedAtUtc
        };
    }

    // =========================================================
    // TENANT HELPERS
    // =========================================================
    private bool IsTenant()
    {
        return _httpContextAccessor
            .HttpContext?
            .User
            .IsInRole("Tenant") == true;
    }

    private int? GetCurrentUserId()
    {
        var userId =
            _httpContextAccessor
                .HttpContext?
                .User
                .FindFirst(
                    ClaimTypes.NameIdentifier)?
                .Value;

        return int.TryParse(
            userId,
            out var id)
            ? id
            : null;
    }
}