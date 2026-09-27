namespace PropertyManagement.Api.DTOs.Expenses;

using PropertyManagement.Api.Entities.Enums;

public class UpdateExpenseRequest
{
    public int PropertyId { get; set; }
    public int? BuildingId { get; set; }
    public int? UnitId { get; set; }
    public ExpenseCategory Category { get; set; }
    public decimal Amount { get; set; }
    public DateOnly ExpenseDate { get; set; }
    public string VendorName { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? ReceiptUrl { get; set; }
}