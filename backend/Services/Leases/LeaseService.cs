using Microsoft.EntityFrameworkCore;
using PropertyManagement.Api.Data;
using PropertyManagement.Api.DTOs.Leases;
using PropertyManagement.Api.Entities;
using PropertyManagement.Api.Entities.Enums;
using PropertyManagement.Api.Services.Notifications;

namespace PropertyManagement.Api.Services.Leases;

public class LeaseService : ILeaseService
{
    private readonly ApplicationDbContext _context;
    private readonly INotificationService _notificationService;

    public bool LastDeleteHadPayments { get; private set; }

    public LeaseService(
        ApplicationDbContext context,
        INotificationService notificationService)
    {
        _context = context;
        _notificationService = notificationService;
    }

    public async Task<List<LeaseResponse>> GetAllAsync()
    {
        return await _context.Leases
            .AsNoTracking()
            .Include(l => l.Unit)
            .Include(l => l.Tenant)
            .Select(l => new LeaseResponse
            {
                Id = l.Id,
                UnitId = l.UnitId,
                UnitNumber = l.Unit.UnitNumber,
                TenantId = l.TenantId,
                TenantName = l.Tenant.FirstName + " " + l.Tenant.LastName,
                StartDate = l.StartDate,
                EndDate = l.EndDate,
                RentAmount = l.RentAmount,
                SecurityDepositAmount = l.SecurityDepositAmount,
                SecurityDepositPaid = l.SecurityDepositPaid,
                RentDueDayOfMonth = l.RentDueDayOfMonth,
                Status = l.Status,
                Terms = l.Terms,
                CreatedAtUtc = l.CreatedAtUtc
            })
            .ToListAsync();
    }

    public async Task<LeaseResponse?> GetByIdAsync(int id)
    {
        return await _context.Leases
            .AsNoTracking()
            .Include(l => l.Unit)
            .Include(l => l.Tenant)
            .Where(l => l.Id == id)
            .Select(l => new LeaseResponse
            {
                Id = l.Id,
                UnitId = l.UnitId,
                UnitNumber = l.Unit.UnitNumber,
                TenantId = l.TenantId,
                TenantName = l.Tenant.FirstName + " " + l.Tenant.LastName,
                StartDate = l.StartDate,
                EndDate = l.EndDate,
                RentAmount = l.RentAmount,
                SecurityDepositAmount = l.SecurityDepositAmount,
                SecurityDepositPaid = l.SecurityDepositPaid,
                RentDueDayOfMonth = l.RentDueDayOfMonth,
                Status = l.Status,
                Terms = l.Terms,
                CreatedAtUtc = l.CreatedAtUtc
            })
            .FirstOrDefaultAsync();
    }

    public async Task<List<LeaseResponse>?> GetByUnitIdAsync(int unitId)
    {
        var unitExists = await _context.Units
            .AnyAsync(u => u.Id == unitId);

        if (!unitExists)
        {
            return null;
        }

        return await _context.Leases
            .AsNoTracking()
            .Include(l => l.Unit)
            .Include(l => l.Tenant)
            .Where(l => l.UnitId == unitId)
            .Select(l => new LeaseResponse
            {
                Id = l.Id,
                UnitId = l.UnitId,
                UnitNumber = l.Unit.UnitNumber,
                TenantId = l.TenantId,
                TenantName = l.Tenant.FirstName + " " + l.Tenant.LastName,
                StartDate = l.StartDate,
                EndDate = l.EndDate,
                RentAmount = l.RentAmount,
                SecurityDepositAmount = l.SecurityDepositAmount,
                SecurityDepositPaid = l.SecurityDepositPaid,
                RentDueDayOfMonth = l.RentDueDayOfMonth,
                Status = l.Status,
                Terms = l.Terms,
                CreatedAtUtc = l.CreatedAtUtc
            })
            .ToListAsync();
    }

    public async Task<List<LeaseResponse>?> GetByTenantIdAsync(int tenantId)
    {
        var tenantExists = await _context.Tenants
            .AnyAsync(t => t.Id == tenantId);

        if (!tenantExists)
        {
            return null;
        }

        return await _context.Leases
            .AsNoTracking()
            .Include(l => l.Unit)
            .Include(l => l.Tenant)
            .Where(l => l.TenantId == tenantId)
            .Select(l => new LeaseResponse
            {
                Id = l.Id,
                UnitId = l.UnitId,
                UnitNumber = l.Unit.UnitNumber,
                TenantId = l.TenantId,
                TenantName = l.Tenant.FirstName + " " + l.Tenant.LastName,
                StartDate = l.StartDate,
                EndDate = l.EndDate,
                RentAmount = l.RentAmount,
                SecurityDepositAmount = l.SecurityDepositAmount,
                SecurityDepositPaid = l.SecurityDepositPaid,
                RentDueDayOfMonth = l.RentDueDayOfMonth,
                Status = l.Status,
                Terms = l.Terms,
                CreatedAtUtc = l.CreatedAtUtc
            })
            .ToListAsync();
    }

    public async Task<List<LeaseResponse>> GetByUserIdAsync(int userId)
    {
        return await _context.Leases
            .AsNoTracking()
            .Include(l => l.Unit)
            .Include(l => l.Tenant)
            .Where(l => l.Tenant.UserId == userId)
            .Select(l => new LeaseResponse
            {
                Id = l.Id,
                UnitId = l.UnitId,
                UnitNumber = l.Unit.UnitNumber,
                TenantId = l.TenantId,
                TenantName = l.Tenant.FirstName + " " + l.Tenant.LastName,
                StartDate = l.StartDate,
                EndDate = l.EndDate,
                RentAmount = l.RentAmount,
                SecurityDepositAmount = l.SecurityDepositAmount,
                SecurityDepositPaid = l.SecurityDepositPaid,
                RentDueDayOfMonth = l.RentDueDayOfMonth,
                Status = l.Status,
                Terms = l.Terms,
                CreatedAtUtc = l.CreatedAtUtc
            })
            .ToListAsync();
    }

    public async Task<LeaseResponse?> CreateAsync(CreateLeaseRequest request)
    {
        var unit = await _context.Units
            .FirstOrDefaultAsync(u => u.Id == request.UnitId);

        if (unit is null)
        {
            return null;
        }

        var tenantExists = await _context.Tenants
            .AnyAsync(t => t.Id == request.TenantId);

        if (!tenantExists)
        {
            return null;
        }

        ValidateLeaseDates(
            request.StartDate,
            request.EndDate);

        await ValidateActiveLeaseConflictAsync(
            request.UnitId,
            request.StartDate,
            request.EndDate);

        var lease = new Lease
        {
            UnitId = request.UnitId,
            TenantId = request.TenantId,
            StartDate = request.StartDate,
            EndDate = request.EndDate,
            RentAmount = request.RentAmount,
            SecurityDepositAmount = request.SecurityDepositAmount,
            SecurityDepositPaid = request.SecurityDepositPaid,
            RentDueDayOfMonth = request.RentDueDayOfMonth,
            Status = request.Status,
            Terms = request.Terms,
            CreatedAtUtc = DateTime.UtcNow
        };

        _context.Leases.Add(lease);

        // Only an Active lease makes the unit occupied.
        if (request.Status == LeaseStatus.Active)
        {
            unit.Status = UnitStatus.Occupied;
        }

        await _context.SaveChangesAsync();

        if (lease.Status == LeaseStatus.Active)
        {
            var today = DateOnly.FromDateTime(DateTime.UtcNow);
            var startsTodayOrEarlier = lease.StartDate <= today;
            var title = startsTodayOrEarlier
                ? "Lease Started"
                : "Lease Created";
            var message = startsTodayOrEarlier
                ? $"Your lease for Unit {unit.UnitNumber} is active through {lease.EndDate:dd MMM yyyy}."
                : $"Your lease for Unit {unit.UnitNumber} is active and starts on {lease.StartDate:dd MMM yyyy}.";

            await NotifyLeaseTenantAsync(
                lease.TenantId,
                title,
                message,
                $"lease:{lease.Id}:activated:{lease.TenantId}:{lease.StartDate:yyyyMMdd}");
        }

        return await GetByIdAsync(lease.Id);
    }

    public async Task<LeaseResponse?> UpdateAsync(
        int id,
        UpdateLeaseRequest request)
    {
        var lease = await _context.Leases
            .FirstOrDefaultAsync(l => l.Id == id);

        if (lease is null)
        {
            return null;
        }

        var unit = await _context.Units
            .FirstOrDefaultAsync(u => u.Id == request.UnitId);

        if (unit is null)
        {
            throw new InvalidOperationException(
                "The specified Unit was not found.");
        }

        var tenantExists = await _context.Tenants
            .AnyAsync(t => t.Id == request.TenantId);

        if (!tenantExists)
        {
            throw new InvalidOperationException(
                "The specified Tenant was not found.");
        }

        ValidateLeaseDates(
            request.StartDate,
            request.EndDate);

        await ValidateActiveLeaseConflictAsync(
            request.UnitId,
            request.StartDate,
            request.EndDate,
            id);

        var previousTenantId = lease.TenantId;
        var previousUnitId = lease.UnitId;
        var previousEndDate = lease.EndDate;
        var previousStatus = lease.Status;
        string? previousUnitNumber = null;

        // If the lease previously belonged to another unit,
        // restore the old unit to Vacant when appropriate.
        if (lease.UnitId != request.UnitId)
        {
            var previousUnit = await _context.Units
                .FirstOrDefaultAsync(u => u.Id == lease.UnitId);

            if (previousUnit is not null)
            {
                previousUnitNumber = previousUnit.UnitNumber;

                var anotherActiveLeaseExists =
                    await _context.Leases.AnyAsync(l =>
                        l.Id != lease.Id &&
                        l.UnitId == previousUnit.Id &&
                        l.Status == LeaseStatus.Active);

                if (!anotherActiveLeaseExists)
                {
                    previousUnit.Status = UnitStatus.Vacant;
                }
            }
        }

        lease.UnitId = request.UnitId;
        lease.TenantId = request.TenantId;
        lease.StartDate = request.StartDate;
        lease.EndDate = request.EndDate;
        lease.RentAmount = request.RentAmount;
        lease.SecurityDepositAmount = request.SecurityDepositAmount;
        lease.SecurityDepositPaid = request.SecurityDepositPaid;
        lease.RentDueDayOfMonth = request.RentDueDayOfMonth;
        lease.Status = request.Status;
        lease.Terms = request.Terms;

        // Synchronize the current unit with the lease status.
        if (request.Status == LeaseStatus.Active)
        {
            unit.Status = UnitStatus.Occupied;
        }
        else
        {
            var anotherActiveLeaseExists =
                await _context.Leases.AnyAsync(l =>
                    l.Id != lease.Id &&
                    l.UnitId == unit.Id &&
                    l.Status == LeaseStatus.Active);

            if (!anotherActiveLeaseExists)
            {
                unit.Status = UnitStatus.Vacant;
            }
        }

        await _context.SaveChangesAsync();

        if (request.Status == LeaseStatus.Active &&
            (previousStatus != LeaseStatus.Active ||
             previousTenantId != lease.TenantId))
        {
            if (previousStatus == LeaseStatus.Active &&
                previousTenantId != lease.TenantId)
            {
                await NotifyLeaseTenantAsync(
                    previousTenantId,
                    "Lease Updated",
                    $"Your lease for Unit {previousUnitNumber ?? "your unit"} has been reassigned.",
                    $"lease:{lease.Id}:tenant-changed:{previousTenantId}:{lease.TenantId}");
            }

            var today = DateOnly.FromDateTime(DateTime.UtcNow);
            var startsTodayOrEarlier = lease.StartDate <= today;
            var title = startsTodayOrEarlier
                ? "Lease Started"
                : "Lease Created";
            var message = startsTodayOrEarlier
                ? $"Your lease for Unit {unit.UnitNumber} is active through {lease.EndDate:dd MMM yyyy}."
                : $"Your lease for Unit {unit.UnitNumber} is active and starts on {lease.StartDate:dd MMM yyyy}.";

            await NotifyLeaseTenantAsync(
                lease.TenantId,
                title,
                message,
                $"lease:{lease.Id}:activated:{lease.TenantId}:{lease.StartDate:yyyyMMdd}");
        }
            else if (previousStatus == LeaseStatus.Active &&
                 request.Status == LeaseStatus.Active &&
                 previousUnitId != lease.UnitId)
            {
                await NotifyLeaseTenantAsync(
                lease.TenantId,
                "Lease Unit Updated",
                $"Your lease is now assigned to Unit {unit.UnitNumber}.",
                $"lease:{lease.Id}:unit-changed:{previousUnitId}:{lease.UnitId}");
            }
        else if (previousStatus == LeaseStatus.Active &&
                 request.Status == LeaseStatus.Active &&
                 lease.EndDate > previousEndDate)
        {
            await NotifyLeaseTenantAsync(
                lease.TenantId,
                "Lease Renewed",
                $"Your lease for Unit {unit.UnitNumber} has been extended through {lease.EndDate:dd MMM yyyy}.",
                $"lease:{lease.Id}:renewed:{lease.TenantId}:{lease.EndDate:yyyyMMdd}");
        }
        else if (previousStatus == LeaseStatus.Active &&
                 request.Status is LeaseStatus.Expired or LeaseStatus.TerminatedEarly)
        {
            var title = request.Status == LeaseStatus.Expired
                ? "Lease Ended"
                : "Lease Terminated";

            await NotifyLeaseTenantAsync(
                lease.TenantId,
                title,
                $"Your lease for Unit {unit.UnitNumber} is no longer active.",
                $"lease:{lease.Id}:ended:{lease.TenantId}:{request.Status}");
        }

        return await GetByIdAsync(lease.Id);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        LastDeleteHadPayments = false;

        var lease = await _context.Leases
            .FirstOrDefaultAsync(l => l.Id == id);

        if (lease is null)
        {
            return false;
        }

        var hasPayments = await _context.Payments
            .AnyAsync(p => p.LeaseId == id);

        if (hasPayments)
        {
            LastDeleteHadPayments = true;
            return false;
        }

        var unit = await _context.Units
            .FirstOrDefaultAsync(u => u.Id == lease.UnitId);

        _context.Leases.Remove(lease);

        if (unit is not null && lease.Status == LeaseStatus.Active)
        {
            var anotherActiveLeaseExists =
                await _context.Leases.AnyAsync(l =>
                    l.Id != lease.Id &&
                    l.UnitId == unit.Id &&
                    l.Status == LeaseStatus.Active);

            if (!anotherActiveLeaseExists)
            {
                unit.Status = UnitStatus.Vacant;
            }
        }

        await _context.SaveChangesAsync();

        return true;
    }

    private async Task NotifyLeaseTenantAsync(
        int tenantId,
        string title,
        string message,
        string notificationKey)
    {
        var userId = await _context.Tenants
            .Where(t => t.Id == tenantId)
            .Select(t => t.UserId)
            .FirstOrDefaultAsync();

        if (!userId.HasValue)
        {
            return;
        }

        await _notificationService.CreateOnceAsync(
            userId.Value,
            title,
            message,
            "Lease",
            notificationKey);
    }

    private async Task ValidateActiveLeaseConflictAsync(
        int unitId,
        DateOnly startDate,
        DateOnly endDate,
        int? excludeLeaseId = null)
    {
        var query = _context.Leases
            .Where(l =>
                l.UnitId == unitId &&
                l.Status == LeaseStatus.Active &&
                startDate <= l.EndDate &&
                endDate >= l.StartDate);

        if (excludeLeaseId.HasValue)
        {
            query = query.Where(l => l.Id != excludeLeaseId.Value);
        }

        var conflictExists = await query.AnyAsync();

        if (conflictExists)
        {
            throw new InvalidOperationException(
                "The unit already has an active lease that overlaps the specified dates.");
        }
    }

    private static void ValidateLeaseDates(
        DateOnly startDate,
        DateOnly endDate)
    {
        if (endDate < startDate)
        {
            throw new InvalidOperationException(
                "Lease end date cannot be before the start date.");
        }
    }
}