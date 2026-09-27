using PropertyManagement.Api.Entities.Enums;

namespace PropertyManagement.Api.Entities;

public class UnitRequest
{
    public int Id { get; set; }

    public int TenantId { get; set; }

    public int UnitId { get; set; }

    public UnitRequestStatus Status { get; set; } =
        UnitRequestStatus.Pending;

    public string? Message { get; set; }

    public string? RejectionReason { get; set; }

    public DateTime CreatedAtUtc { get; set; } =
        DateTime.UtcNow;

    public DateTime? ReviewedAtUtc { get; set; }

    public int? ReviewedByUserId { get; set; }

    // Navigation properties
    public Tenant Tenant { get; set; } = null!;

    public Unit Unit { get; set; } = null!;

    public User? ReviewedByUser { get; set; }
}