using Microsoft.EntityFrameworkCore;
using PropertyManagement.Api.Data;
using PropertyManagement.Api.DTOs.Units;
using PropertyManagement.Api.Entities;
using PropertyManagement.Api.Entities.Enums;

namespace PropertyManagement.Api.Services.Units;

public class UnitService : IUnitService
{
    private readonly ApplicationDbContext _context;

    public UnitService(ApplicationDbContext context)
    {
        _context = context;
    }

    public bool LastDeleteHadDependencies { get; private set; }

    public async Task<List<UnitResponse>> GetAllAsync()
    {
        return await _context.Units
            .AsNoTracking()
            .Include(u => u.Building)
            .Select(u => new UnitResponse
            {
                Id = u.Id,
                BuildingId = u.BuildingId,
                BuildingName = u.Building.Name,
                UnitNumber = u.UnitNumber,
                Floor = u.Floor,
                Bedrooms = u.Bedrooms,
                Bathrooms = u.Bathrooms,
                SquareFeet = u.SquareFeet,
                TargetRent = u.TargetRent,
                Status = u.Status,
                CreatedAtUtc = u.CreatedAtUtc
            })
            .ToListAsync();
    }

    public async Task<UnitResponse?> GetByIdAsync(int id)
    {
        return await _context.Units
            .AsNoTracking()
            .Include(u => u.Building)
            .Where(u => u.Id == id)
            .Select(u => new UnitResponse
            {
                Id = u.Id,
                BuildingId = u.BuildingId,
                BuildingName = u.Building.Name,
                UnitNumber = u.UnitNumber,
                Floor = u.Floor,
                Bedrooms = u.Bedrooms,
                Bathrooms = u.Bathrooms,
                SquareFeet = u.SquareFeet,
                TargetRent = u.TargetRent,
                Status = u.Status,
                CreatedAtUtc = u.CreatedAtUtc
            })
            .FirstOrDefaultAsync();
    }

    public async Task<List<UnitResponse>?> GetByBuildingIdAsync(int buildingId)
    {
        var buildingExists = await _context.Buildings
            .AnyAsync(b => b.Id == buildingId);

        if (!buildingExists)
        {
            return null;
        }

        return await _context.Units
            .AsNoTracking()
            .Include(u => u.Building)
            .Where(u => u.BuildingId == buildingId)
            .Select(u => new UnitResponse
            {
                Id = u.Id,
                BuildingId = u.BuildingId,
                BuildingName = u.Building.Name,
                UnitNumber = u.UnitNumber,
                Floor = u.Floor,
                Bedrooms = u.Bedrooms,
                Bathrooms = u.Bathrooms,
                SquareFeet = u.SquareFeet,
                TargetRent = u.TargetRent,
                Status = u.Status,
                CreatedAtUtc = u.CreatedAtUtc
            })
            .ToListAsync();
    }

    public async Task<List<UnitResponse>> GetByUserIdAsync(int userId)
{
    return await _context.Units
        .AsNoTracking()
        .Include(u => u.Building)
        .Where(u => u.Leases.Any(l =>
            l.Tenant.UserId == userId))
        .Select(u => new UnitResponse
        {
            Id = u.Id,
            BuildingId = u.BuildingId,
            BuildingName = u.Building.Name,
            UnitNumber = u.UnitNumber,
            Floor = u.Floor,
            Bedrooms = u.Bedrooms,
            Bathrooms = u.Bathrooms,
            SquareFeet = u.SquareFeet,
            TargetRent = u.TargetRent,
            Status = u.Status,
            CreatedAtUtc = u.CreatedAtUtc
        })
        .ToListAsync();
}

    public async Task<UnitResponse?> CreateAsync(CreateUnitRequest request)
    {
        var buildingExists = await _context.Buildings
            .AnyAsync(b => b.Id == request.BuildingId);

        if (!buildingExists)
        {
            return null;
        }

        var unit = new Unit
        {
            BuildingId = request.BuildingId,
            UnitNumber = request.UnitNumber.Trim(),
            Floor = request.Floor,
            Bedrooms = request.Bedrooms,
            Bathrooms = request.Bathrooms,
            SquareFeet = request.SquareFeet,
            TargetRent = request.TargetRent,
            Status = request.Status,
            CreatedAtUtc = DateTime.UtcNow
        };

        _context.Units.Add(unit);
        await _context.SaveChangesAsync();

        return await GetByIdAsync(unit.Id);
    }

    public async Task<UnitResponse?> UpdateAsync(
        int id,
        UpdateUnitRequest request)
    {
        var unit = await _context.Units
            .FirstOrDefaultAsync(u => u.Id == id);

        if (unit is null)
        {
            return null;
        }

        unit.UnitNumber = request.UnitNumber.Trim();
        unit.Floor = request.Floor;
        unit.Bedrooms = request.Bedrooms;
        unit.Bathrooms = request.Bathrooms;
        unit.SquareFeet = request.SquareFeet;
        unit.TargetRent = request.TargetRent;
        unit.Status = request.Status;

        await _context.SaveChangesAsync();

        return await GetByIdAsync(id);
    }

    public async Task<List<AvailableUnitResponse>> GetAvailableUnitsAsync()
{
    return await _context.Units
        .AsNoTracking()
        .Where(u => u.Status == UnitStatus.Vacant)
        .Select(u => new AvailableUnitResponse
        {
            Id = u.Id,
            BuildingId = u.BuildingId,
            BuildingName = u.Building.Name,

            PropertyId = u.Building.PropertyId,
            PropertyName = u.Building.Property.Name,

            UnitNumber = u.UnitNumber,
            Floor = u.Floor,
            Bedrooms = u.Bedrooms,
            Bathrooms = u.Bathrooms,
            SquareFeet = u.SquareFeet,
            TargetRent = u.TargetRent
        })
        .OrderBy(u => u.PropertyName)
        .ThenBy(u => u.BuildingName)
        .ThenBy(u => u.UnitNumber)
        .ToListAsync();
}

    public async Task<bool> DeleteAsync(int id)
    {
        LastDeleteHadDependencies = false;

        var unit = await _context.Units
            .FirstOrDefaultAsync(u => u.Id == id);

        if (unit is null)
        {
            return false;
        }

        var hasLeases = await _context.Leases
            .AnyAsync(l => l.UnitId == id);

        var hasExpenses = await _context.Expenses
            .AnyAsync(e => e.UnitId == id);

        var hasMaintenanceRequests = await _context.MaintenanceRequests
            .AnyAsync(m => m.UnitId == id);

        if (hasLeases || hasExpenses || hasMaintenanceRequests)
        {
            LastDeleteHadDependencies = true;
            return false;
        }

        _context.Units.Remove(unit);
        await _context.SaveChangesAsync();

        return true;
    }
}