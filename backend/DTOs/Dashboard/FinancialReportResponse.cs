namespace PropertyManagement.Api.DTOs.Dashboard;

public class FinancialReportResponse
{
    public int PropertyId { get; set; }
    public string PropertyName { get; set; } = string.Empty;

    public decimal TotalPaymentIncome { get; set; }
    public decimal TotalExpenses { get; set; }
    public decimal NetIncome { get; set; }
}