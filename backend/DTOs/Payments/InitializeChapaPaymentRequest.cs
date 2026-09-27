using PropertyManagement.Api.Entities.Enums;

namespace PropertyManagement.Api.DTOs.Payments;

public class InitializeChapaPaymentRequest
{
    public int LeaseId { get; set; }

    public decimal Amount { get; set; }

    public DateOnly DueDate { get; set; }

    public PaymentType PaymentType { get; set; }

    public List<RentPaymentPeriodRequest> RentPeriods { get; set; } = new();
}

public class RentPaymentPeriodRequest
{
    public DateOnly DueDate { get; set; }

    public decimal Amount { get; set; }
}