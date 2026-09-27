using Microsoft.EntityFrameworkCore;
using PropertyManagement.Api.Data;
using PropertyManagement.Api.DTOs.Tenants;
using PropertyManagement.Api.Entities;

namespace PropertyManagement.Api.Services.Tenants;

public class TenantService : ITenantService
{
    private readonly ApplicationDbContext _context;

    public TenantService(ApplicationDbContext context)
    {
        _context = context;
    }

    public bool LastDeleteHadDependencies { get; private set; }

    public async Task<List<TenantResponse>> GetAllAsync()
    {
        return await _context.Tenants
            .AsNoTracking()
            .Include(t => t.User)
            .Select(t => new TenantResponse
            {
                Id = t.Id,
                UserId = t.UserId,
                UserEmail = t.User != null ? t.User.Email : null,
                FirstName = t.FirstName,
                LastName = t.LastName,
                Email = t.Email,
                PhoneNumber = t.PhoneNumber,
                EmergencyContactName = t.EmergencyContactName,
                EmergencyContactPhone = t.EmergencyContactPhone,
                CreatedAtUtc = t.CreatedAtUtc
            })
            .ToListAsync();
    }

    public async Task<TenantResponse?> GetByUserIdAsync(int userId)
{
    return await _context.Tenants
        .AsNoTracking()
        .Include(t => t.User)
        .Where(t => t.UserId == userId)
        .Select(t => new TenantResponse
        {
            Id = t.Id,
            UserId = t.UserId,
            UserEmail = t.User != null ? t.User.Email : null,
            FirstName = t.FirstName,
            LastName = t.LastName,
            Email = t.Email,
            PhoneNumber = t.PhoneNumber,
            EmergencyContactName = t.EmergencyContactName,
            EmergencyContactPhone = t.EmergencyContactPhone,
            CreatedAtUtc = t.CreatedAtUtc
        })
        .FirstOrDefaultAsync();
}

    public async Task<TenantResponse?> GetByIdAsync(int id)
    {
        return await _context.Tenants
            .AsNoTracking()
            .Include(t => t.User)
            .Where(t => t.Id == id)
            .Select(t => new TenantResponse
            {
                Id = t.Id,
                UserId = t.UserId,
                UserEmail = t.User != null ? t.User.Email : null,
                FirstName = t.FirstName,
                LastName = t.LastName,
                Email = t.Email,
                PhoneNumber = t.PhoneNumber,
                EmergencyContactName = t.EmergencyContactName,
                EmergencyContactPhone = t.EmergencyContactPhone,
                CreatedAtUtc = t.CreatedAtUtc
            })
            .FirstOrDefaultAsync();
    }

    public async Task<TenantResponse?> CreateAsync(CreateTenantRequest request)
    {
        if (request.UserId.HasValue)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == request.UserId.Value);

            if (user is null)
            {
                return null;
            }

            var userAlreadyLinked = await _context.Tenants
                .AnyAsync(t => t.UserId == request.UserId.Value);

            if (userAlreadyLinked)
            {
                throw new InvalidOperationException(
                    "This user is already linked to a tenant.");
            }
        }

        var tenant = new Tenant
        {
            UserId = request.UserId,
            FirstName = request.FirstName.Trim(),
            LastName = request.LastName.Trim(),
            Email = request.Email.Trim(),
            PhoneNumber = request.PhoneNumber.Trim(),
            EmergencyContactName = string.IsNullOrWhiteSpace(
                request.EmergencyContactName)
                ? null
                : request.EmergencyContactName.Trim(),
            EmergencyContactPhone = string.IsNullOrWhiteSpace(
                request.EmergencyContactPhone)
                ? null
                : request.EmergencyContactPhone.Trim(),
            CreatedAtUtc = DateTime.UtcNow
        };

        _context.Tenants.Add(tenant);
        await _context.SaveChangesAsync();

        return await GetByIdAsync(tenant.Id);
    }

    public async Task<TenantResponse?> UpdateAsync(
        int id,
        UpdateTenantRequest request)
    {
        var tenant = await _context.Tenants
            .FirstOrDefaultAsync(t => t.Id == id);

        if (tenant is null)
        {
            return null;
        }

        if (request.UserId.HasValue)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == request.UserId.Value);

            if (user is null)
            {
                throw new InvalidOperationException(
                    $"User with ID {request.UserId.Value} was not found.");
            }

            var userAlreadyLinked = await _context.Tenants
                .AnyAsync(t =>
                    t.UserId == request.UserId.Value &&
                    t.Id != id);

            if (userAlreadyLinked)
            {
                throw new InvalidOperationException(
                    "This user is already linked to another tenant.");
            }
        }

        tenant.UserId = request.UserId;
        tenant.FirstName = request.FirstName.Trim();
        tenant.LastName = request.LastName.Trim();
        tenant.Email = request.Email.Trim();
        tenant.PhoneNumber = request.PhoneNumber.Trim();
        tenant.EmergencyContactName = string.IsNullOrWhiteSpace(
            request.EmergencyContactName)
            ? null
            : request.EmergencyContactName.Trim();
        tenant.EmergencyContactPhone = string.IsNullOrWhiteSpace(
            request.EmergencyContactPhone)
            ? null
            : request.EmergencyContactPhone.Trim();

        await _context.SaveChangesAsync();

        return await GetByIdAsync(id);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        LastDeleteHadDependencies = false;

        var tenant = await _context.Tenants
            .FirstOrDefaultAsync(t => t.Id == id);

        if (tenant is null)
        {
            return false;
        }

        var hasLeases = await _context.Leases
            .AnyAsync(l => l.TenantId == id);

        var hasMaintenanceRequests = await _context.MaintenanceRequests
            .AnyAsync(m => m.ReportedByTenantId == id);

        if (hasLeases || hasMaintenanceRequests)
        {
            LastDeleteHadDependencies = true;
            return false;
        }

        _context.Tenants.Remove(tenant);
        await _context.SaveChangesAsync();

        return true;
    }
}