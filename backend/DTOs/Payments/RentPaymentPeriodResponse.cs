namespace PropertyManagement.Api.DTOs.Payments;

public class RentPaymentPeriodResponse
{
    public DateOnly DueDate { get; set; }

    public decimal RentAmount { get; set; }

    public decimal PaidAmount { get; set; }

    public decimal RemainingAmount { get; set; }
}