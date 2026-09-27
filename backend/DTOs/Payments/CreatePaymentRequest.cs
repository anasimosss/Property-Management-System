namespace PropertyManagement.Api.DTOs.Payments;

using PropertyManagement.Api.Entities.Enums;

public class CreatePaymentRequest
{
    public int LeaseId { get; set; }
    public decimal Amount { get; set; }
    public DateTime PaymentDate { get; set; }
    public DateOnly DueDate { get; set; }
    public PaymentType PaymentType { get; set; }
    public PaymentMethod PaymentMethod { get; set; }
    public PaymentStatus Status { get; set; }
    public string? ReferenceNumber { get; set; }
    public string? Notes { get; set; }
    public PaymentChannel PaymentChannel { get; set; } = PaymentChannel.None;
}