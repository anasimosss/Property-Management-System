namespace PropertyManagement.Api.DTOs.Units;

public class AvailableUnitResponse
{
    public int Id { get; set; }

    public int BuildingId { get; set; }
    public string BuildingName { get; set; } = string.Empty;

    public int PropertyId { get; set; }
    public string PropertyName { get; set; } = string.Empty;

    public string UnitNumber { get; set; } = string.Empty;

    public int? Floor { get; set; }

    public int Bedrooms { get; set; }

    public decimal Bathrooms { get; set; }

    public decimal? SquareFeet { get; set; }

    public decimal TargetRent { get; set; }
}