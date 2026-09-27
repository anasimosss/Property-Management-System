namespace PropertyManagement.Api.DTOs.Payments;

public class InitializeChapaPaymentResponse
{
    public int PaymentId { get; set; }
    public string TxRef { get; set; } = string.Empty;
    public string CheckoutUrl { get; set; } = string.Empty;
}