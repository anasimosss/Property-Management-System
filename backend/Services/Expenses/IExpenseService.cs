using PropertyManagement.Api.DTOs.Expenses;

namespace PropertyManagement.Api.Services.Expenses;

public interface IExpenseService
{
    Task<List<ExpenseResponse>> GetAllAsync();
    Task<ExpenseResponse?> GetByIdAsync(int id);
    Task<List<ExpenseResponse>?> GetByPropertyIdAsync(int propertyId);
    Task<ExpenseResponse?> CreateAsync(
        CreateExpenseRequest request,
        int recordedByUserId);
    Task<ExpenseResponse?> UpdateAsync(
        int id,
        UpdateExpenseRequest request);
    Task<bool> DeleteAsync(int id);
}