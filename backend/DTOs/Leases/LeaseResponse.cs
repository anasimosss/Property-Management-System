namespace PropertyManagement.Api.DTOs.Leases;

using PropertyManagement.Api.Entities.Enums;

public class LeaseResponse
{
    public int Id { get; set; }
    public int UnitId { get; set; }
    public string UnitNumber { get; set; } = string.Empty;
    public int TenantId { get; set; }
    public string TenantName { get; set; } = string.Empty;
    public DateOnly StartDate { get; set; }
    public DateOnly EndDate { get; set; }
    public decimal RentAmount { get; set; }
    public decimal SecurityDepositAmount { get; set; }
    public bool SecurityDepositPaid { get; set; }
    public int RentDueDayOfMonth { get; set; }
    public LeaseStatus Status { get; set; }
    public string? Terms { get; set; }
    public DateTime CreatedAtUtc { get; set; }
}