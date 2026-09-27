using Microsoft.EntityFrameworkCore;
using PropertyManagement.Api.Data;
using PropertyManagement.Api.DTOs.Buildings;
using PropertyManagement.Api.Entities;

namespace PropertyManagement.Api.Services;

public class BuildingService : IBuildingService
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<BuildingService> _logger;

    public BuildingService(ApplicationDbContext context, ILogger<BuildingService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<IReadOnlyList<BuildingResponse>> GetByUserIdAsync(int userId)
{
    var buildings = await _context.Buildings
        .AsNoTracking()
        .Include(b => b.Property)
        .Where(b => b.Units.Any(u =>
            u.Leases.Any(l =>
                l.Tenant.UserId == userId)))
        .OrderBy(b => b.Name)
        .ToListAsync();

    return buildings
        .Select(ToResponse)
        .ToList();
}

    public async Task<IReadOnlyList<BuildingResponse>> GetAllAsync()
    {
        var buildings = await _context.Buildings
            .AsNoTracking()
            .Include(b => b.Property)
            .OrderBy(b => b.Name)
            .ToListAsync();

        return buildings.Select(ToResponse).ToList();
    }

    public async Task<BuildingResponse?> GetByIdAsync(int id)
    {
        var building = await _context.Buildings
            .AsNoTracking()
            .Include(b => b.Property)
            .FirstOrDefaultAsync(b => b.Id == id);

        return building is null ? null : ToResponse(building);
    }

    public async Task<IReadOnlyList<BuildingResponse>?> GetByPropertyIdAsync(int propertyId)
    {
        // Verify the property exists
        var propertyExists = await _context.Properties.AnyAsync(p => p.Id == propertyId);
        if (!propertyExists)
        {
            return null;
        }

        var buildings = await _context.Buildings
            .AsNoTracking()
            .Include(b => b.Property)
            .Where(b => b.PropertyId == propertyId)
            .OrderBy(b => b.Name)
            .ToListAsync();

        return buildings.Select(ToResponse).ToList();
    }

    public async Task<BuildingResponse> CreateAsync(CreateBuildingRequest request)
    {
        // Verify the property exists
        var propertyExists = await _context.Properties.AnyAsync(p => p.Id == request.PropertyId);
        if (!propertyExists)
        {
            throw new InvalidOperationException($"Property with ID {request.PropertyId} was not found.");
        }

        var building = new Building
        {
            PropertyId = request.PropertyId,
            Name = request.Name.Trim(),
            Floors = request.Floors,
            CreatedAtUtc = DateTime.UtcNow
        };

        _context.Buildings.Add(building);
        await _context.SaveChangesAsync();

        // Reload with Property navigation for response
        var createdBuilding = await _context.Buildings
            .AsNoTracking()
            .Include(b => b.Property)
            .FirstAsync(b => b.Id == building.Id);

        _logger.LogInformation("Building created: Id={BuildingId}, Name={Name}, PropertyId={PropertyId}", 
            building.Id, building.Name, building.PropertyId);

        return ToResponse(createdBuilding);
    }

    public async Task<BuildingResponse?> UpdateAsync(int id, UpdateBuildingRequest request)
    {
        var building = await _context.Buildings.FindAsync(id);

        if (building is null)
        {
            return null;
        }

        building.Name = request.Name.Trim();
        building.Floors = request.Floors;

        await _context.SaveChangesAsync();

        // Reload with Property navigation for response
        var updatedBuilding = await _context.Buildings
            .AsNoTracking()
            .Include(b => b.Property)
            .FirstAsync(b => b.Id == id);

        _logger.LogInformation("Building updated: Id={BuildingId}", building.Id);

        return ToResponse(updatedBuilding);
    }

    public async Task<(bool found, bool deleted, string? conflictReason)> DeleteAsync(int id)
    {
        var building = await _context.Buildings
            .Include(b => b.Units)
            .Include(b => b.Expenses)
            .FirstOrDefaultAsync(b => b.Id == id);

        if (building is null)
        {
            return (found: false, deleted: false, conflictReason: null);
        }

        // Check for Units linked to the Building
        if (building.Units.Count > 0)
        {
            return (found: true, deleted: false,
                conflictReason: $"Cannot delete building '{building.Name}': it has {building.Units.Count} unit(s). Remove units first.");
        }

        // Check for Expenses directly linked to the Building
        if (building.Expenses.Count > 0)
        {
            return (found: true, deleted: false,
                conflictReason: $"Cannot delete building '{building.Name}': it has {building.Expenses.Count} expense record(s). Remove expenses first.");
        }

        _context.Buildings.Remove(building);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Building deleted: Id={BuildingId}, Name={Name}", id, building.Name);

        return (found: true, deleted: true, conflictReason: null);
    }

    // ── Mapping ──────────────────────────────────────────────────────────────

    private static BuildingResponse ToResponse(Building building) => new()
    {
        Id = building.Id,
        PropertyId = building.PropertyId,
        PropertyName = building.Property?.Name ?? "Unknown Property",
        Name = building.Name,
        Floors = building.Floors,
        CreatedAtUtc = building.CreatedAtUtc
    };
}
