using Microsoft.EntityFrameworkCore;
using PropertyManagement.Api.Data;
using PropertyManagement.Api.DTOs.Dashboard;
using PropertyManagement.Api.Entities.Enums;

namespace PropertyManagement.Api.Services.Dashboard;

public class DashboardService : IDashboardService
{
    private readonly ApplicationDbContext _context;

    public DashboardService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<DashboardSummaryResponse> GetSummaryAsync()
    {
        var totalProperties = await _context.Properties.CountAsync();

        var totalBuildings = await _context.Buildings.CountAsync();

        var totalUnits = await _context.Units.CountAsync();

        var totalTenants = await _context.Tenants.CountAsync();

        var activeLeases = await _context.Leases
            .CountAsync(l => l.Status == LeaseStatus.Active);

        var occupiedUnits = await _context.Leases
            .Where(l => l.Status == LeaseStatus.Active)
            .Select(l => l.UnitId)
            .Distinct()
            .CountAsync();

        var vacantUnits = Math.Max(
            totalUnits - occupiedUnits,
            0);

        var totalPaymentIncome = await _context.Payments
            .Where(p => p.Status == PaymentStatus.Completed)
            .SumAsync(p => (decimal?)p.Amount) ?? 0m;

        var totalExpenses = await _context.Expenses
            .SumAsync(e => (decimal?)e.Amount) ?? 0m;

        var openMaintenanceRequests = await _context.MaintenanceRequests
            .CountAsync(m =>
                m.Status != MaintenanceStatus.Resolved &&
                m.Status != MaintenanceStatus.Cancelled);

        var highPriorityMaintenanceRequests =
            await _context.MaintenanceRequests
                .CountAsync(m =>
                    m.Priority == MaintenancePriority.High &&
                    m.Status != MaintenanceStatus.Resolved &&
                    m.Status != MaintenanceStatus.Cancelled);

        var emergencyMaintenanceRequests =
            await _context.MaintenanceRequests
                .CountAsync(m =>
                    m.Priority == MaintenancePriority.Emergency &&
                    m.Status != MaintenanceStatus.Resolved &&
                    m.Status != MaintenanceStatus.Cancelled);

        return new DashboardSummaryResponse
        {
            TotalProperties = totalProperties,
            TotalBuildings = totalBuildings,
            TotalUnits = totalUnits,
            TotalTenants = totalTenants,
            ActiveLeases = activeLeases,

            OccupiedUnits = occupiedUnits,
            VacantUnits = vacantUnits,

            TotalPaymentIncome = totalPaymentIncome,
            TotalExpenses = totalExpenses,
            NetIncome = totalPaymentIncome - totalExpenses,

            OpenMaintenanceRequests = openMaintenanceRequests,
            HighPriorityMaintenanceRequests =
                highPriorityMaintenanceRequests,
            EmergencyMaintenanceRequests =
                emergencyMaintenanceRequests
        };
    }
    public async Task<FinancialReportResponse?> GetFinancialReportAsync(int propertyId)
{
    var property = await _context.Properties
        .FirstOrDefaultAsync(p => p.Id == propertyId);

    if (property == null)
    {
        return null;
    }

    var totalPaymentIncome = await _context.Payments
        .Where(p =>
            p.Status == PaymentStatus.Completed &&
            p.Lease.Unit.Building.PropertyId == propertyId)
        .SumAsync(p => (decimal?)p.Amount) ?? 0m;

    var totalExpenses = await _context.Expenses
        .Where(e => e.PropertyId == propertyId)
        .SumAsync(e => (decimal?)e.Amount) ?? 0m;

    return new FinancialReportResponse
    {
        PropertyId = property.Id,
        PropertyName = property.Name,
        TotalPaymentIncome = totalPaymentIncome,
        TotalExpenses = totalExpenses,
        NetIncome = totalPaymentIncome - totalExpenses
    };
}

public async Task<LeaseOccupancyReportResponse> GetLeaseOccupancyReportAsync()
{
    var totalUnits = await _context.Units.CountAsync();

    var occupiedUnits = await _context.Leases
        .Where(l => l.Status == LeaseStatus.Active)
        .Select(l => l.UnitId)
        .Distinct()
        .CountAsync();

    var activeLeases = await _context.Leases
        .CountAsync(l => l.Status == LeaseStatus.Active);

    var vacantUnits = Math.Max(totalUnits - occupiedUnits, 0);

    var occupancyRate = totalUnits > 0
        ? (decimal)occupiedUnits / totalUnits * 100
        : 0;

    return new LeaseOccupancyReportResponse
    {
        TotalUnits = totalUnits,
        OccupiedUnits = occupiedUnits,
        VacantUnits = vacantUnits,
        ActiveLeases = activeLeases,
        OccupancyRate = Math.Round(occupancyRate, 2)
    };
}

public async Task<MaintenanceReportResponse> GetMaintenanceReportAsync()
{
    var totalRequests = await _context.MaintenanceRequests.CountAsync();

    var openRequests = await _context.MaintenanceRequests
        .CountAsync(m => m.Status == MaintenanceStatus.Open);

    var assignedRequests = await _context.MaintenanceRequests
        .CountAsync(m => m.Status == MaintenanceStatus.Assigned);

    var inProgressRequests = await _context.MaintenanceRequests
        .CountAsync(m => m.Status == MaintenanceStatus.InProgress);

    var onHoldRequests = await _context.MaintenanceRequests
        .CountAsync(m => m.Status == MaintenanceStatus.OnHold);

    var resolvedRequests = await _context.MaintenanceRequests
        .CountAsync(m => m.Status == MaintenanceStatus.Resolved);

    var cancelledRequests = await _context.MaintenanceRequests
        .CountAsync(m => m.Status == MaintenanceStatus.Cancelled);

    var lowPriorityRequests = await _context.MaintenanceRequests
        .CountAsync(m => m.Priority == MaintenancePriority.Low);

    var mediumPriorityRequests = await _context.MaintenanceRequests
        .CountAsync(m => m.Priority == MaintenancePriority.Medium);

    var highPriorityRequests = await _context.MaintenanceRequests
        .CountAsync(m => m.Priority == MaintenancePriority.High);

    var emergencyRequests = await _context.MaintenanceRequests
        .CountAsync(m => m.Priority == MaintenancePriority.Emergency);

    return new MaintenanceReportResponse
    {
        TotalRequests = totalRequests,
        OpenRequests = openRequests,
        AssignedRequests = assignedRequests,
        InProgressRequests = inProgressRequests,
        OnHoldRequests = onHoldRequests,
        ResolvedRequests = resolvedRequests,
        CancelledRequests = cancelledRequests,

        LowPriorityRequests = lowPriorityRequests,
        MediumPriorityRequests = mediumPriorityRequests,
        HighPriorityRequests = highPriorityRequests,
        EmergencyRequests = emergencyRequests
    };
}
}