using Microsoft.EntityFrameworkCore;
using PropertyManagement.Api.Data;
using PropertyManagement.Api.Entities;
using PropertyManagement.Api.Entities.Enums;

namespace PropertyManagement.Api.Services.Notifications;

public class RentNotificationProcessor(
    ApplicationDbContext context,
    INotificationService notificationService,
    IConfiguration configuration)
{
    private readonly ApplicationDbContext _context = context;
    private readonly INotificationService _notificationService =
        notificationService;
    private readonly int _rentDueSoonDays = Math.Max(
        0,
        configuration.GetValue<int?>("Notifications:RentDueSoonDays") ?? 3);
    private readonly int _leaseEndingSoonDays = Math.Max(
        0,
        configuration.GetValue<int?>("Notifications:LeaseEndingSoonDays") ?? 30);

    public async Task ProcessAsync(
        DateOnly today,
        CancellationToken cancellationToken = default)
    {
        var leases = await _context.Leases
            .AsNoTracking()
            .Where(l =>
                l.Status == LeaseStatus.Active &&
                l.Tenant.UserId != null)
            .Include(l => l.Tenant)
            .Include(l => l.Unit)
            .Include(l => l.Payments.Where(p =>
                p.PaymentType == PaymentType.Rent &&
                p.Status == PaymentStatus.Completed))
            .ToListAsync(cancellationToken);

        var dueSoonThrough = today.AddDays(_rentDueSoonDays);
        var leaseEndingSoonThrough = today.AddDays(_leaseEndingSoonDays);

        foreach (var lease in leases)
        {
            cancellationToken.ThrowIfCancellationRequested();

            var userId = lease.Tenant.UserId;

            if (!userId.HasValue)
            {
                continue;
            }

            await NotifyLeaseEndingSoonAsync(
                lease,
                userId.Value,
                today,
                leaseEndingSoonThrough);

            var paidByDueDate = lease.Payments
                .GroupBy(payment => payment.DueDate)
                .ToDictionary(
                    group => group.Key,
                    group => group.Sum(payment => payment.Amount));

            var month = new DateOnly(
                lease.StartDate.Year,
                lease.StartDate.Month,
                1);
            var currentMonth = new DateOnly(today.Year, today.Month, 1);

            while (month <= currentMonth)
            {
                var dueDate = new DateOnly(
                    month.Year,
                    month.Month,
                    Math.Min(
                        lease.RentDueDayOfMonth,
                        DateTime.DaysInMonth(month.Year, month.Month)));

                if (dueDate >= lease.StartDate &&
                    dueDate <= lease.EndDate &&
                    dueDate <= today.AddDays(_rentDueSoonDays))
                {
                    var paidAmount = paidByDueDate.GetValueOrDefault(dueDate);
                    var remainingAmount =
                        Math.Max(lease.RentAmount - paidAmount, 0);

                    if (remainingAmount > 0)
                    {
                        if (dueDate < today)
                        {
                            await NotifyRentOverdueAsync(
                                lease,
                                userId.Value,
                                dueDate,
                                paidAmount,
                                remainingAmount);
                        }
                        else if (dueDate <= dueSoonThrough)
                        {
                            await NotifyRentDueSoonAsync(
                                lease,
                                userId.Value,
                                dueDate,
                                paidAmount,
                                remainingAmount);
                        }
                    }
                }

                month = month.AddMonths(1);
            }
        }
    }

    private Task NotifyLeaseEndingSoonAsync(
        Lease lease,
        int userId,
        DateOnly today,
        DateOnly leaseEndingSoonThrough)
    {
        if (lease.EndDate < today ||
            lease.EndDate > leaseEndingSoonThrough)
        {
            return Task.CompletedTask;
        }

        return _notificationService.CreateOnceAsync(
            userId,
            "Lease Ending Soon",
            $"Your lease for Unit {lease.Unit.UnitNumber} ends on {lease.EndDate:dd MMM yyyy}.",
            "Lease",
            $"lease:{lease.Id}:tenant:{lease.TenantId}:ending-soon:{lease.EndDate:yyyyMMdd}");
    }

    private Task NotifyRentDueSoonAsync(
        Lease lease,
        int userId,
        DateOnly dueDate,
        decimal paidAmount,
        decimal remainingAmount)
    {
        return _notificationService.CreateOnceAsync(
            userId,
            "Rent Due Soon",
            $"Rent for Unit {lease.Unit.UnitNumber} is due on {dueDate:dd MMM yyyy}. Rent amount: {lease.RentAmount:N2} ETB. Paid: {paidAmount:N2} ETB. Remaining: {remainingAmount:N2} ETB.",
            "RentDueSoon",
            $"lease:{lease.Id}:tenant:{lease.TenantId}:rent-due-soon:{dueDate:yyyyMMdd}");
    }

    private Task NotifyRentOverdueAsync(
        Lease lease,
        int userId,
        DateOnly dueDate,
        decimal paidAmount,
        decimal remainingAmount)
    {
        return _notificationService.CreateOnceAsync(
            userId,
            "Rent Overdue",
            $"Rent for Unit {lease.Unit.UnitNumber} was due on {dueDate:dd MMM yyyy}. Rent amount: {lease.RentAmount:N2} ETB. Paid: {paidAmount:N2} ETB. Remaining: {remainingAmount:N2} ETB.",
            "RentOverdue",
            $"lease:{lease.Id}:tenant:{lease.TenantId}:rent-overdue:{dueDate:yyyyMMdd}");
    }
}