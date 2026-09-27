using PropertyManagement.Api.Entities.Enums;

namespace PropertyManagement.Api.DTOs.Units;

public class CreateUnitRequest
{
    public int BuildingId { get; set; }
    public string UnitNumber { get; set; } = string.Empty;
    public int? Floor { get; set; }
    public int Bedrooms { get; set; }
    public decimal Bathrooms { get; set; }
    public decimal? SquareFeet { get; set; }
    public decimal TargetRent { get; set; }
    public UnitStatus Status { get; set; } = UnitStatus.Vacant;
}