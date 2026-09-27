namespace PropertyManagement.Api.DTOs.Buildings;

/// <summary>
/// API-facing Building data returned from all Building endpoints.
/// Navigation properties and EF Core tracking information are never exposed.
/// </summary>
public class BuildingResponse
{
    public int Id { get; set; }
    public int PropertyId { get; set; }
    public string PropertyName { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public int? Floors { get; set; }
    public DateTime CreatedAtUtc { get; set; }
}
