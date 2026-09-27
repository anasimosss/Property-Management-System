namespace PropertyManagement.Api.DTOs.Expenses;

using PropertyManagement.Api.Entities.Enums;

public class ExpenseResponse
{
    public int Id { get; set; }
    public int PropertyId { get; set; }
    public string PropertyName { get; set; } = string.Empty;
    public int? BuildingId { get; set; }
    public string? BuildingName { get; set; }
    public int? UnitId { get; set; }
    public string? UnitNumber { get; set; }
    public int RecordedByUserId { get; set; }
    public string RecordedByUserName { get; set; } = string.Empty;
    public ExpenseCategory Category { get; set; }
    public decimal Amount { get; set; }
    public DateOnly ExpenseDate { get; set; }
    public string VendorName { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? ReceiptUrl { get; set; }
    public DateTime CreatedAtUtc { get; set; }
}