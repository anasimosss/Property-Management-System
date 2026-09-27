namespace PropertyManagement.Api.DTOs.Payments;

using PropertyManagement.Api.Entities.Enums;

public class MyRentResponse
{
    public int LeaseId { get; set; }

    public string UnitNumber { get; set; } = string.Empty;

    public decimal RentAmount { get; set; }

    public decimal PaidAmount { get; set; }

    public decimal RemainingAmount { get; set; }

    public DateOnly DueDate { get; set; }

    public PaymentStatus Status { get; set; }

    public int? PaymentId { get; set; }
}