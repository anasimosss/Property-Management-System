namespace PropertyManagement.Api.DTOs.Dashboard;

public class DashboardSummaryResponse
{
    public int TotalProperties { get; set; }
    public int TotalBuildings { get; set; }
    public int TotalUnits { get; set; }
    public int TotalTenants { get; set; }
    public int ActiveLeases { get; set; }

    public int OccupiedUnits { get; set; }
    public int VacantUnits { get; set; }

    public decimal TotalPaymentIncome { get; set; }
    public decimal TotalExpenses { get; set; }
    public decimal NetIncome { get; set; }

    public int OpenMaintenanceRequests { get; set; }
    public int HighPriorityMaintenanceRequests { get; set; }
    public int EmergencyMaintenanceRequests { get; set; }
}