namespace PropertyManagement.Api.Entities;

public class Building
{
    public int Id { get; set; }
    public int PropertyId { get; set; }
    public string Name { get; set; } = string.Empty;
    public int? Floors { get; set; }
    public string Address { get; set; } = string.Empty;
    public string? City { get; set; }
    public string? StateOrRegion { get; set; }
    public string? PostalCode { get; set; }
    public string? Country { get; set; }
    public string? Purpose { get; set; }
    public int? YearBuilt { get; set; }
    public string? Description { get; set; }
    public string? Status { get; set; }
    public string? ManagementNotes { get; set; }
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAtUtc { get; set; }
    public DateTime? DeletedAtUtc { get; set; }
    public bool IsDeleted { get; set; } = false;
    public Guid? CreatedBy { get; set; }
    public Guid? UpdatedBy { get; set; }
    public Guid? DeletedBy { get; set; }
    // Navigation properties
    public Property Property { get; set; } = null!;
    public ICollection<Unit> Units { get; set; } = new List<Unit>();
    public ICollection<Expense> Expenses { get; set; } = new List<Expense>();
}
