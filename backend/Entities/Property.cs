namespace PropertyManagement.Api.Entities;

using PropertyManagement.Api.Entities.Enums;

public class Property
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Country { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string? RegionOrSubCity { get; set; }
    public string AddressLine1 { get; set; } = string.Empty;
    public string? AddressLine2 { get; set; }
    public string? PostalCode { get; set; }
    public PropertyType PropertyType { get; set; }
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public ICollection<Building> Buildings { get; set; } = new List<Building>();
    public ICollection<Expense> Expenses { get; set; } = new List<Expense>();
    public ICollection<MaintenanceRequest> MaintenanceRequests { get; set; } = new List<MaintenanceRequest>();
}
