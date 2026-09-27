using PropertyManagement.Api.DTOs.Payments;

namespace PropertyManagement.Api.Services.Payments;

public interface IPaymentService
{
    Task<List<PaymentResponse>> GetAllAsync();
    Task<MyRentResponse?> GetMyRentAsync();
    Task<List<RentPaymentPeriodResponse>> GetRentPaymentPeriodsAsync(
    int months);
    Task<PaymentResponse?> GetByIdAsync(int id);
    Task<List<PaymentResponse>?> GetByLeaseIdAsync(int leaseId);
    Task<PaymentResponse?> CreateAsync(CreatePaymentRequest request);
    Task<PaymentResponse?> UpdateAsync(int id, UpdatePaymentRequest request);
    Task<bool> DeleteAsync(int id);

    Task<InitializeChapaPaymentResponse> InitializeChapaPaymentAsync(
        InitializeChapaPaymentRequest request);

    Task<PaymentResponse?> VerifyChapaPaymentAsync(string txRef);
}