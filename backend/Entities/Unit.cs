namespace PropertyManagement.Api.Entities;

using PropertyManagement.Api.Entities.Enums;

public class Unit
{
    public int Id { get; set; }
    public int BuildingId { get; set; }
    public string UnitNumber { get; set; } = string.Empty;
    public int? Floor { get; set; }
    public int Bedrooms { get; set; }
    public decimal Bathrooms { get; set; }
    public decimal? SquareFeet { get; set; }
    public decimal TargetRent { get; set; }
    public UnitStatus Status { get; set; } = UnitStatus.Vacant;
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public Building Building { get; set; } = null!;
    public ICollection<Lease> Leases { get; set; } = new List<Lease>();
    public ICollection<Expense> Expenses { get; set; } = new List<Expense>();
    public ICollection<MaintenanceRequest> MaintenanceRequests { get; set; } = new List<MaintenanceRequest>();
}
