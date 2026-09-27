namespace PropertyManagement.Api.DTOs.Leases;

using PropertyManagement.Api.Entities.Enums;

public class CreateLeaseRequest
{
    public int UnitId { get; set; }
    public int TenantId { get; set; }
    public DateOnly StartDate { get; set; }
    public DateOnly EndDate { get; set; }
    public decimal RentAmount { get; set; }
    public decimal SecurityDepositAmount { get; set; }
    public bool SecurityDepositPaid { get; set; }
    public int RentDueDayOfMonth { get; set; }
    public LeaseStatus Status { get; set; } = LeaseStatus.Draft;
    public string? Terms { get; set; }
}