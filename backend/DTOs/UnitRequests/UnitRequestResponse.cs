using PropertyManagement.Api.Entities.Enums;

namespace PropertyManagement.Api.DTOs.UnitRequests;

public class UnitRequestResponse
{
    public int Id { get; set; }

    public int TenantId { get; set; }

    public string TenantName { get; set; } = string.Empty;

    public string TenantEmail { get; set; } = string.Empty;

    public int UnitId { get; set; }

    public string UnitNumber { get; set; } = string.Empty;

    public string BuildingName { get; set; } = string.Empty;

    public decimal TargetRent { get; set; }

    public UnitRequestStatus Status { get; set; }

    public string? Message { get; set; }

    public string? RejectionReason { get; set; }

    public DateTime CreatedAtUtc { get; set; }

    public DateTime? ReviewedAtUtc { get; set; }

    public string? ReviewedByName { get; set; }
}