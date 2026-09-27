using Microsoft.EntityFrameworkCore;
using PropertyManagement.Api.Data;
using PropertyManagement.Api.DTOs.Properties;
using PropertyManagement.Api.Entities;
using PropertyManagement.Api.Entities.Enums;

namespace PropertyManagement.Api.Services;

public class PropertyService : IPropertyService
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<PropertyService> _logger;

    public PropertyService(
        ApplicationDbContext context,
        ILogger<PropertyService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<IReadOnlyList<PropertyResponse>> GetByUserIdAsync(int userId)
{
    var properties = await _context.Properties
        .AsNoTracking()
        .Include(p => p.Buildings)
            .ThenInclude(b => b.Units)
                .ThenInclude(u => u.Leases)
        .Where(p => p.Buildings.Any(b =>
            b.Units.Any(u =>
                u.Leases.Any(l =>
                    l.Tenant.UserId == userId))))
        .OrderBy(p => p.Name)
        .ToListAsync();

    return properties
        .Select(ToResponse)
        .ToList();
}

    public async Task<IReadOnlyList<PropertyResponse>> GetAllAsync()
    {
        var properties = await _context.Properties
            .AsNoTracking()
            .Include(p => p.Buildings)
                .ThenInclude(b => b.Units)
                    .ThenInclude(u => u.Leases)
            .OrderBy(p => p.Name)
            .ToListAsync();

        return properties
            .Select(ToResponse)
            .ToList();
    }

    public async Task<PropertyResponse?> GetByIdAsync(int id)
    {
        var property = await _context.Properties
            .AsNoTracking()
            .Include(p => p.Buildings)
                .ThenInclude(b => b.Units)
                    .ThenInclude(u => u.Leases)
            .FirstOrDefaultAsync(p => p.Id == id);

        return property is null
            ? null
            : ToResponse(property);
    }

    public async Task<PropertyResponse> CreateAsync(
        CreatePropertyRequest request)
    {
        var property = new Property
        {
            Name = request.Name.Trim(),
            Country = request.Country.Trim(),
            City = request.City.Trim(),
            RegionOrSubCity = request.RegionOrSubCity?.Trim(),
            AddressLine1 = request.AddressLine1.Trim(),
            AddressLine2 = request.AddressLine2?.Trim(),
            PostalCode = request.PostalCode?.Trim(),
            PropertyType = request.PropertyType,
            CreatedAtUtc = DateTime.UtcNow
        };

        _context.Properties.Add(property);

        await _context.SaveChangesAsync();

        _logger.LogInformation(
            "Property created: Id={PropertyId}, Name={Name}",
            property.Id,
            property.Name);

        return ToResponse(property);
    }

    public async Task<PropertyResponse?> UpdateAsync(
        int id,
        UpdatePropertyRequest request)
    {
        var property = await _context.Properties.FindAsync(id);

        if (property is null)
        {
            return null;
        }

        property.Name = request.Name.Trim();
        property.Country = request.Country.Trim();
        property.City = request.City.Trim();
        property.RegionOrSubCity = request.RegionOrSubCity?.Trim();
        property.AddressLine1 = request.AddressLine1.Trim();
        property.AddressLine2 = request.AddressLine2?.Trim();
        property.PostalCode = request.PostalCode?.Trim();
        property.PropertyType = request.PropertyType;

        await _context.SaveChangesAsync();

        _logger.LogInformation(
            "Property updated: Id={PropertyId}",
            property.Id);

        return ToResponse(property);
    }

    public async Task<(bool found, bool deleted, string? conflictReason)>
        DeleteAsync(int id)
    {
        var property = await _context.Properties
            .Include(p => p.Expenses)
            .Include(p => p.MaintenanceRequests)
            .Include(p => p.Buildings)
                .ThenInclude(b => b.Units)
                    .ThenInclude(u => u.Leases)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (property is null)
        {
            return (
                found: false,
                deleted: false,
                conflictReason: null);
        }

        if (property.Expenses.Count > 0)
        {
            return (
                found: true,
                deleted: false,
                conflictReason:
                    $"Cannot delete property '{property.Name}': " +
                    $"it has {property.Expenses.Count} expense record(s). " +
                    "Remove expenses first.");
        }

        if (property.MaintenanceRequests.Count > 0)
        {
            return (
                found: true,
                deleted: false,
                conflictReason:
                    $"Cannot delete property '{property.Name}': " +
                    $"it has {property.MaintenanceRequests.Count} " +
                    "maintenance request(s). " +
                    "Remove maintenance requests first.");
        }

        var leaseCount = property.Buildings
            .SelectMany(b => b.Units)
            .SelectMany(u => u.Leases)
            .Count();

        if (leaseCount > 0)
        {
            return (
                found: true,
                deleted: false,
                conflictReason:
                    $"Cannot delete property '{property.Name}': " +
                    $"it has {leaseCount} lease(s) on its units. " +
                    "Remove leases first.");
        }

        _context.Properties.Remove(property);

        await _context.SaveChangesAsync();

        _logger.LogInformation(
            "Property deleted: Id={PropertyId}, Name={Name}",
            id,
            property.Name);

        return (
            found: true,
            deleted: true,
            conflictReason: null);
    }

    private static PropertyResponse ToResponse(Property property)
    {
        var buildings = property.Buildings;

        var units = buildings
            .SelectMany(b => b.Units)
            .ToList();

        var occupiedUnits = units.Count(u =>
            u.Status == UnitStatus.Occupied);

        var monthlyIncome = units
            .SelectMany(u => u.Leases)
            .Where(l => l.Status == LeaseStatus.Active)
            .Sum(l => l.RentAmount);

        return new PropertyResponse
        {
            Id = property.Id,
            Name = property.Name,
            Country = property.Country,
            City = property.City,
            RegionOrSubCity = property.RegionOrSubCity,
            AddressLine1 = property.AddressLine1,
            AddressLine2 = property.AddressLine2,
            PostalCode = property.PostalCode,
            PropertyType = property.PropertyType.ToString(),
            CreatedAtUtc = property.CreatedAtUtc,

            BuildingCount = buildings.Count,
            TotalUnits = units.Count,
            OccupiedUnits = occupiedUnits,
            MonthlyIncome = monthlyIncome
        };
    }
}