using PropertyManagement.Api.DTOs.Dashboard;

namespace PropertyManagement.Api.Services.Dashboard;

public interface IDashboardService
{
    Task<DashboardSummaryResponse> GetSummaryAsync();

    Task<FinancialReportResponse?> GetFinancialReportAsync(int propertyId);

    Task<LeaseOccupancyReportResponse> GetLeaseOccupancyReportAsync();

    Task<MaintenanceReportResponse> GetMaintenanceReportAsync();
}