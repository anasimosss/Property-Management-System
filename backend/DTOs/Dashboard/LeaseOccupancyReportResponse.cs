namespace PropertyManagement.Api.DTOs.Dashboard;

public class LeaseOccupancyReportResponse
{
    public int TotalUnits { get; set; }
    public int OccupiedUnits { get; set; }
    public int VacantUnits { get; set; }
    public int ActiveLeases { get; set; }
    public decimal OccupancyRate { get; set; }
}