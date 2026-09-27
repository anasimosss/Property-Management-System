namespace PropertyManagement.Api.DTOs.Dashboard;

public class MaintenanceReportResponse
{
    public int TotalRequests { get; set; }
    public int OpenRequests { get; set; }
    public int AssignedRequests { get; set; }
    public int InProgressRequests { get; set; }
    public int OnHoldRequests { get; set; }
    public int ResolvedRequests { get; set; }
    public int CancelledRequests { get; set; }

    public int LowPriorityRequests { get; set; }
    public int MediumPriorityRequests { get; set; }
    public int HighPriorityRequests { get; set; }
    public int EmergencyRequests { get; set; }
}