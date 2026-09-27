namespace PropertyManagement.Api.Entities;

using PropertyManagement.Api.Entities.Enums;

public class Payment
{
    public int Id { get; set; }
    public int LeaseId { get; set; }
    public decimal Amount { get; set; }
    public DateTime PaymentDate { get; set; }
    public DateOnly DueDate { get; set; }
    public PaymentType PaymentType { get; set; }
    public PaymentMethod PaymentMethod { get; set; }
    public PaymentStatus Status { get; set; }
    public string? ReferenceNumber { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
    public PaymentChannel PaymentChannel { get; set; } = PaymentChannel.None;
    public string? ChapaTransactionReference { get; set; }

    // Navigation properties
    public Lease Lease { get; set; } = null!;
}
