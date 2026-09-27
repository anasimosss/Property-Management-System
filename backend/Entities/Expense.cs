namespace PropertyManagement.Api.Entities;

using PropertyManagement.Api.Entities.Enums;

public class Expense
{
    public int Id { get; set; }
    public int PropertyId { get; set; }
    public int? BuildingId { get; set; }
    public int? UnitId { get; set; }
    public int RecordedByUserId { get; set; }
    public ExpenseCategory Category { get; set; }
    public decimal Amount { get; set; }
    public DateOnly ExpenseDate { get; set; }
    public string VendorName { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? ReceiptUrl { get; set; }
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public Property Property { get; set; } = null!;
    public Building? Building { get; set; }
    public Unit? Unit { get; set; }
    public User RecordedByUser { get; set; } = null!;
}
