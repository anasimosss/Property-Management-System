namespace PropertyManagement.Api.DTOs.Payments;

using PropertyManagement.Api.Entities.Enums;

public class PaymentResponse
{
    public int Id { get; set; }
    public int LeaseId { get; set; }
    public string UnitNumber { get; set; } = string.Empty;
    public int TenantId { get; set; }
    public string TenantName { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public DateTime PaymentDate { get; set; }
    public DateOnly DueDate { get; set; }
    public PaymentType PaymentType { get; set; }
    public PaymentMethod PaymentMethod { get; set; }
    public PaymentStatus Status { get; set; }
    public string? ReferenceNumber { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAtUtc { get; set; }
    public PaymentChannel PaymentChannel { get; set; }
    public string? ChapaTransactionReference { get; set; }
}