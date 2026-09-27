namespace PropertyManagement.Api.DTOs.Properties;

/// <summary>
/// API-facing Property data returned from all Property endpoints.
/// Navigation properties and EF Core tracking information are never exposed.
/// </summary>
public class PropertyResponse
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Country { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string? RegionOrSubCity { get; set; }
    public string AddressLine1 { get; set; } = string.Empty;
    public string? AddressLine2 { get; set; }
    public string? PostalCode { get; set; }

    /// <summary>PropertyType stored as string for clean JSON serialization.</summary>
    public string PropertyType { get; set; } = string.Empty;

    public DateTime CreatedAtUtc { get; set; }

    public int BuildingCount { get; set; }
    public int TotalUnits { get; set; }
    public int OccupiedUnits { get; set; }
    public decimal MonthlyIncome { get; set; }
}