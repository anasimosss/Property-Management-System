namespace PropertyManagement.Api.Entities;

using PropertyManagement.Api.Entities.Enums;

public class Lease
{
    public int Id { get; set; }
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
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public Unit Unit { get; set; } = null!;
    public Tenant Tenant { get; set; } = null!;
    public ICollection<Payment> Payments { get; set; } = new List<Payment>();
}
