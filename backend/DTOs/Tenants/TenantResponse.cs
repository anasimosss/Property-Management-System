namespace PropertyManagement.Api.DTOs.Tenants;

public class TenantResponse
{
    public int Id { get; set; }
    public int? UserId { get; set; }
    public string? UserEmail { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string? EmergencyContactName { get; set; }
    public string? EmergencyContactPhone { get; set; }
    public DateTime CreatedAtUtc { get; set; }
}