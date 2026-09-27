using Microsoft.EntityFrameworkCore;
using PropertyManagement.Api.Data;
using PropertyManagement.Api.DTOs.Payments;
using PropertyManagement.Api.Entities;
using PropertyManagement.Api.Entities.Enums;
using PropertyManagement.Api.Services.Chapa;
using System.Security.Claims;
using System.Text.Json;

namespace PropertyManagement.Api.Services.Payments;

public class PaymentService(
    ApplicationDbContext context,
    ChapaPaymentService chapaPaymentService,
    IHttpContextAccessor httpContextAccessor,
    IConfiguration configuration) : IPaymentService
{
    private readonly ApplicationDbContext _context = context;
    private readonly ChapaPaymentService _chapaPaymentService = chapaPaymentService;
    private readonly IHttpContextAccessor _httpContextAccessor = httpContextAccessor;
    private readonly IConfiguration _configuration = configuration;

    // =========================================================
    // GET MY RENT
    // =========================================================
    public async Task<MyRentResponse?> GetMyRentAsync()
    {
        var userId = GetCurrentUserId();

        if (userId is null || !IsTenant())
        {
            return null;
        }

        var tenant = await _context.Tenants
            .AsNoTracking()
            .FirstOrDefaultAsync(t => t.UserId == userId.Value);

        if (tenant is null)
        {
            return null;
        }

        var lease = await _context.Leases
            .AsNoTracking()
            .Include(l => l.Unit)
            .Include(l => l.Payments)
            .Where(l =>
                l.TenantId == tenant.Id &&
                l.Status == LeaseStatus.Active)
            .OrderByDescending(l => l.StartDate)
            .FirstOrDefaultAsync();

        if (lease is null)
        {
            return null;
        }

        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        var year = today.Year;
        var month = today.Month;

        var dueDate = new DateOnly(
            year,
            month,
            Math.Min(
                lease.RentDueDayOfMonth,
                DateTime.DaysInMonth(year, month))
        );

        var paidAmount = lease.Payments
            .Where(p =>
                p.DueDate == dueDate &&
                p.PaymentType == PaymentType.Rent &&
                p.Status == PaymentStatus.Completed)
            .Sum(p => p.Amount);

        // If the current month's rent is fully paid,
        // move to the next rent period.
        if (paidAmount >= lease.RentAmount)
        {
            var nextMonth = today.AddMonths(1);

            year = nextMonth.Year;
            month = nextMonth.Month;

            dueDate = new DateOnly(
                year,
                month,
                Math.Min(
                    lease.RentDueDayOfMonth,
                    DateTime.DaysInMonth(year, month))
            );

            paidAmount = lease.Payments
                .Where(p =>
                    p.DueDate == dueDate &&
                    p.PaymentType == PaymentType.Rent &&
                    p.Status == PaymentStatus.Completed)
                .Sum(p => p.Amount);
        }

        var remainingAmount =
            Math.Max(lease.RentAmount - paidAmount, 0);

        var payment = lease.Payments
            .Where(p =>
                p.DueDate == dueDate &&
                p.PaymentType == PaymentType.Rent)
            .OrderByDescending(p => p.CreatedAtUtc)
            .FirstOrDefault();

        var status =
            remainingAmount <= 0
                ? PaymentStatus.Completed
                : PaymentStatus.Pending;

        return new MyRentResponse
        {
            LeaseId = lease.Id,
            UnitNumber = lease.Unit.UnitNumber,
            RentAmount = lease.RentAmount,
            PaidAmount = paidAmount,
            RemainingAmount = remainingAmount,
            DueDate = dueDate,
            Status = status,
            PaymentId = payment?.Id
        };
    }

    // =========================================================
    // GET RENT PAYMENT PERIODS
    // =========================================================
    public async Task<List<RentPaymentPeriodResponse>>
        GetRentPaymentPeriodsAsync(int months)
    {
        var userId = GetCurrentUserId();

        if (userId is null || !IsTenant())
        {
            return new List<RentPaymentPeriodResponse>();
        }

        if (months <= 0)
        {
            throw new InvalidOperationException(
                "Number of months must be greater than 0.");
        }

        if (months > 12)
        {
            throw new InvalidOperationException(
                "You can request a maximum of 12 months at a time.");
        }

        var tenant = await _context.Tenants
            .AsNoTracking()
            .FirstOrDefaultAsync(
                t => t.UserId == userId.Value);

        if (tenant is null)
        {
            return new List<RentPaymentPeriodResponse>();
        }

        var lease = await _context.Leases
            .AsNoTracking()
            .Include(l => l.Payments)
            .Where(l =>
                l.TenantId == tenant.Id &&
                l.Status == LeaseStatus.Active)
            .OrderByDescending(l => l.StartDate)
            .FirstOrDefaultAsync();

        if (lease is null)
        {
            return new List<RentPaymentPeriodResponse>();
        }

        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        // Start with the current rent period.
        var firstPeriod = today;

        // Keep moving forward while the rent period
        // is already fully paid.
        while (true)
        {
            var periodDueDate = new DateOnly(
                firstPeriod.Year,
                firstPeriod.Month,
                Math.Min(
                    lease.RentDueDayOfMonth,
                    DateTime.DaysInMonth(
                        firstPeriod.Year,
                        firstPeriod.Month))
            );

            var paidAmount =
                lease.Payments
                    .Where(p =>
                        p.DueDate == periodDueDate &&
                        p.PaymentType == PaymentType.Rent &&
                        p.Status == PaymentStatus.Completed)
                    .Sum(p => p.Amount);

            if (paidAmount < lease.RentAmount)
            {
                break;
            }

            firstPeriod = firstPeriod.AddMonths(1);
        }

        today = firstPeriod;

        var periods =
            new List<RentPaymentPeriodResponse>();

        for (var i = 0; i < months; i++)
        {
            var periodDate = today.AddMonths(i);

            var periodDueDate = new DateOnly(
                periodDate.Year,
                periodDate.Month,
                Math.Min(
                    lease.RentDueDayOfMonth,
                    DateTime.DaysInMonth(
                        periodDate.Year,
                        periodDate.Month))
            );

            var periodPaidAmount =
                lease.Payments
                    .Where(p =>
                        p.DueDate == periodDueDate &&
                        p.PaymentType == PaymentType.Rent &&
                        p.Status == PaymentStatus.Completed)
                    .Sum(p => p.Amount);

            var remainingAmount =
                Math.Max(
                    lease.RentAmount - periodPaidAmount,
                    0);

            periods.Add(
                new RentPaymentPeriodResponse
                {
                    DueDate = periodDueDate,
                    RentAmount = lease.RentAmount,
                    PaidAmount = periodPaidAmount,
                    RemainingAmount = remainingAmount
                });
        }

        return periods;
    }

    // =========================================================
    // GET ALL PAYMENTS
    // =========================================================
    public async Task<List<PaymentResponse>> GetAllAsync()
    {
        var query = _context.Payments
            .AsNoTracking()
            .Include(p => p.Lease)
                .ThenInclude(l => l.Unit)
            .Include(p => p.Lease)
                .ThenInclude(l => l.Tenant)
            .AsQueryable();

        // Tenant can only see their own payments.
        if (IsTenant())
        {
            var userId = GetCurrentUserId();

            if (userId is null)
            {
                return new List<PaymentResponse>();
            }

            query = query.Where(
                p => p.Lease.Tenant.UserId == userId.Value);
        }

        return await query
            .OrderByDescending(p => p.PaymentDate)
            .Select(p => new PaymentResponse
            {
                Id = p.Id,
                LeaseId = p.LeaseId,
                UnitNumber = p.Lease.Unit.UnitNumber,
                TenantId = p.Lease.TenantId,
                TenantName =
                    p.Lease.Tenant.FirstName + " " +
                    p.Lease.Tenant.LastName,
                Amount = p.Amount,
                PaymentDate = p.PaymentDate,
                DueDate = p.DueDate,
                PaymentType = p.PaymentType,
                PaymentMethod = p.PaymentMethod,
                PaymentChannel = p.PaymentChannel,
                Status = p.Status,
                ChapaTransactionReference =
                    p.ChapaTransactionReference,
                Notes = p.Notes,
                CreatedAtUtc = p.CreatedAtUtc
            })
            .ToListAsync();
    }

    // =========================================================
    // GET PAYMENT BY ID
    // =========================================================
    public async Task<PaymentResponse?> GetByIdAsync(int id)
    {
        var query = _context.Payments
            .AsNoTracking()
            .Include(p => p.Lease)
                .ThenInclude(l => l.Unit)
            .Include(p => p.Lease)
                .ThenInclude(l => l.Tenant)
            .Where(p => p.Id == id);

        // Tenant can only access their own payment.
        if (IsTenant())
        {
            var userId = GetCurrentUserId();

            if (userId is null)
            {
                return null;
            }

            query = query.Where(
                p => p.Lease.Tenant.UserId == userId.Value);
        }

        return await query
            .Select(p => new PaymentResponse
            {
                Id = p.Id,
                LeaseId = p.LeaseId,
                UnitNumber = p.Lease.Unit.UnitNumber,
                TenantId = p.Lease.TenantId,
                TenantName =
                    p.Lease.Tenant.FirstName + " " +
                    p.Lease.Tenant.LastName,
                Amount = p.Amount,
                PaymentDate = p.PaymentDate,
                DueDate = p.DueDate,
                PaymentType = p.PaymentType,
                PaymentMethod = p.PaymentMethod,
                PaymentChannel = p.PaymentChannel,
                Status = p.Status,
                ChapaTransactionReference =
                    p.ChapaTransactionReference,
                Notes = p.Notes,
                CreatedAtUtc = p.CreatedAtUtc
            })
            .FirstOrDefaultAsync();
    }

    // =========================================================
    // GET PAYMENTS BY LEASE ID
    // =========================================================
    public async Task<List<PaymentResponse>?> GetByLeaseIdAsync(
        int leaseId)
    {
        var leaseQuery = _context.Leases
            .AsNoTracking()
            .Where(l => l.Id == leaseId);

        // Tenant can only access their own lease.
        if (IsTenant())
        {
            var userId = GetCurrentUserId();

            if (userId is null)
            {
                return null;
            }

            leaseQuery = leaseQuery.Where(
                l => l.Tenant.UserId == userId.Value);
        }

        var leaseExists = await leaseQuery.AnyAsync();

        if (!leaseExists)
        {
            return null;
        }

        return await _context.Payments
            .AsNoTracking()
            .Include(p => p.Lease)
                .ThenInclude(l => l.Unit)
            .Include(p => p.Lease)
                .ThenInclude(l => l.Tenant)
            .Where(p => p.LeaseId == leaseId)
            .OrderByDescending(p => p.PaymentDate)
            .Select(p => new PaymentResponse
            {
                Id = p.Id,
                LeaseId = p.LeaseId,
                UnitNumber = p.Lease.Unit.UnitNumber,
                TenantId = p.Lease.TenantId,
                TenantName =
                    p.Lease.Tenant.FirstName + " " +
                    p.Lease.Tenant.LastName,
                Amount = p.Amount,
                PaymentDate = p.PaymentDate,
                DueDate = p.DueDate,
                PaymentType = p.PaymentType,
                PaymentMethod = p.PaymentMethod,
                PaymentChannel = p.PaymentChannel,
                Status = p.Status,
                ChapaTransactionReference =
                    p.ChapaTransactionReference,
                Notes = p.Notes,
                CreatedAtUtc = p.CreatedAtUtc
            })
            .ToListAsync();
    }

    // =========================================================
    // CREATE PAYMENT
    // =========================================================
    public async Task<PaymentResponse?> CreateAsync(
        CreatePaymentRequest request)
    {
        var lease = await _context.Leases
            .FirstOrDefaultAsync(l => l.Id == request.LeaseId);

        if (lease is null)
        {
            return null;
        }

        ValidatePayment(
            request.Amount,
            request.PaymentDate,
            request.DueDate,
            request.ReferenceNumber,
            request.PaymentMethod,
            request.PaymentChannel);

        var dueDate = request.DueDate;

        if (request.PaymentType == PaymentType.Rent)
        {
            var paymentDate = request.PaymentDate;

            var year = paymentDate.Year;
            var month = paymentDate.Month;

            var lastDayOfMonth =
                DateTime.DaysInMonth(year, month);

            var actualDueDay =
                Math.Min(
                    lease.RentDueDayOfMonth,
                    lastDayOfMonth);

            dueDate = new DateOnly(
                year,
                month,
                actualDueDay);

            var singleRentCompletedAmount =
                await GetCompletedRentAmountAsync(
                    request.LeaseId,
                    dueDate);

            var remainingRent =
                lease.RentAmount -
                singleRentCompletedAmount;

            if (remainingRent <= 0)
            {
                throw new InvalidOperationException(
                    "The rent for this period has already been fully paid.");
            }

            if (request.Amount > remainingRent)
            {
                throw new InvalidOperationException(
                    $"Payment amount cannot exceed the remaining rent balance of {remainingRent:N2} ETB.");
            }
        }

        var payment = new Payment
        {
            LeaseId = request.LeaseId,
            Amount = request.Amount,
            PaymentDate = request.PaymentDate,
            DueDate = dueDate,
            PaymentType = request.PaymentType,
            PaymentMethod = request.PaymentMethod,
            PaymentChannel = request.PaymentChannel,
            Status = request.Status,
            ReferenceNumber =
                string.IsNullOrWhiteSpace(
                    request.ReferenceNumber)
                    ? null
                    : request.ReferenceNumber.Trim(),
            Notes =
                string.IsNullOrWhiteSpace(request.Notes)
                    ? null
                    : request.Notes.Trim(),
            CreatedAtUtc = DateTime.UtcNow
        };

        _context.Payments.Add(payment);

        await _context.SaveChangesAsync();

        return await GetByIdAsync(payment.Id);
    }

    // =========================================================
    // UPDATE PAYMENT
    // =========================================================
    public async Task<PaymentResponse?> UpdateAsync(
        int id,
        UpdatePaymentRequest request)
    {
        var payment = await _context.Payments
            .FirstOrDefaultAsync(p => p.Id == id);

        if (payment is null)
        {
            return null;
        }

        var lease = await _context.Leases
            .FirstOrDefaultAsync(l => l.Id == request.LeaseId);

        if (lease is null)
        {
            throw new InvalidOperationException(
                $"Lease with ID {request.LeaseId} was not found.");
        }

        ValidatePayment(
            request.Amount,
            request.PaymentDate,
            request.DueDate,
            request.ReferenceNumber,
            request.PaymentMethod,
            request.PaymentChannel);

        var dueDate = request.DueDate;

        if (request.PaymentType == PaymentType.Rent)
        {
            var paymentDate = request.PaymentDate;

            var year = paymentDate.Year;
            var month = paymentDate.Month;

            var lastDayOfMonth =
                DateTime.DaysInMonth(year, month);

            var actualDueDay =
                Math.Min(
                    lease.RentDueDayOfMonth,
                    lastDayOfMonth);

            dueDate = new DateOnly(
                year,
                month,
                actualDueDay);
        }

        payment.LeaseId = request.LeaseId;
        payment.Amount = request.Amount;
        payment.PaymentDate = request.PaymentDate;
        payment.DueDate = dueDate;
        payment.PaymentType = request.PaymentType;
        payment.PaymentMethod = request.PaymentMethod;
        payment.PaymentChannel = request.PaymentChannel;
        payment.Status = request.Status;

        payment.ReferenceNumber =
            string.IsNullOrWhiteSpace(request.ReferenceNumber)
                ? null
                : request.ReferenceNumber.Trim();

        payment.Notes =
            string.IsNullOrWhiteSpace(request.Notes)
                ? null
                : request.Notes.Trim();

        await _context.SaveChangesAsync();

        return await GetByIdAsync(id);
    }

    // =========================================================
    // DELETE PAYMENT
    // =========================================================
    public async Task<bool> DeleteAsync(int id)
    {
        var payment = await _context.Payments
            .FirstOrDefaultAsync(p => p.Id == id);

        if (payment is null)
        {
            return false;
        }

        _context.Payments.Remove(payment);

        await _context.SaveChangesAsync();

        return true;
    }

    // =========================================================
    // GET COMPLETED RENT AMOUNT FOR A RENT PERIOD
    // =========================================================
    private async Task<decimal> GetCompletedRentAmountAsync(
        int leaseId,
        DateOnly dueDate)
    {
        return await _context.Payments
            .Where(p =>
                p.LeaseId == leaseId &&
                p.PaymentType == PaymentType.Rent &&
                p.DueDate == dueDate &&
                p.Status == PaymentStatus.Completed)
            .SumAsync(p => p.Amount);
    }

    // =========================================================
    // VERIFY CHAPA PAYMENT
    // =========================================================
    public async Task<PaymentResponse?> VerifyChapaPaymentAsync(
        string txRef)
    {
        if (string.IsNullOrWhiteSpace(txRef))
        {
            throw new InvalidOperationException(
                "Transaction reference is required.");
        }

        // Get ALL local payments belonging to this Chapa transaction.
        var payments = await _context.Payments
            .Where(p =>
                p.ChapaTransactionReference == txRef)
            .OrderBy(p => p.Id)
            .ToListAsync();

        if (payments.Count == 0)
        {
            return null;
        }

        var verificationResponse =
            await _chapaPaymentService.VerifyPaymentAsync(txRef);

        using var document =
            JsonDocument.Parse(verificationResponse);

        var root = document.RootElement;

        // Get the overall Chapa response status.
        var status =
            root.TryGetProperty(
                "status",
                out var statusElement)
                ? statusElement.GetString()
                : null;

        // Get the transaction data.
        if (!root.TryGetProperty(
                "data",
                out var dataElement) ||
            dataElement.ValueKind != JsonValueKind.Object)
        {
            throw new InvalidOperationException(
                "Chapa verification response does not contain transaction data.");
        }

        // Get transaction status.
        var dataStatus =
            dataElement.TryGetProperty(
                "status",
                out var dataStatusElement)
                ? dataStatusElement.GetString()
                : null;

        var finalStatus = dataStatus ?? status;

        // Verify the transaction reference returned by Chapa.
        var chapaTxRef =
            dataElement.TryGetProperty(
                "tx_ref",
                out var txRefElement)
                ? txRefElement.GetString()
                : null;

        if (!string.IsNullOrWhiteSpace(chapaTxRef) &&
            !string.Equals(
                chapaTxRef,
                txRef,
                StringComparison.Ordinal))
        {
            throw new InvalidOperationException(
                "Chapa transaction reference does not match the local payment.");
        }

        // Verify the amount returned by Chapa.
        if (!dataElement.TryGetProperty(
                "amount",
                out var amountElement))
        {
            throw new InvalidOperationException(
                "Chapa verification response does not contain a payment amount.");
        }

        decimal chapaAmount;

        if (amountElement.ValueKind == JsonValueKind.Number)
        {
            chapaAmount = amountElement.GetDecimal();
        }
        else if (
            amountElement.ValueKind == JsonValueKind.String &&
            decimal.TryParse(
                amountElement.GetString(),
                out var parsedAmount))
        {
            chapaAmount = parsedAmount;
        }
        else
        {
            throw new InvalidOperationException(
                "Chapa returned an invalid payment amount.");
        }

        // An advance payment can contain multiple local Payment rows
        // sharing the same Chapa transaction reference.
        //
        // Therefore, compare Chapa's total transaction amount
        // against the SUM of all local payments for this txRef.
        var localTotalAmount =
            payments.Sum(p => p.Amount);

        if (chapaAmount != localTotalAmount)
        {
            throw new InvalidOperationException(
                $"Chapa payment amount ({chapaAmount:N2} ETB) does not match the total local payment amount ({localTotalAmount:N2} ETB).");
        }

        // Verify currency.
        var currency =
            dataElement.TryGetProperty(
                "currency",
                out var currencyElement)
                ? currencyElement.GetString()
                : null;

        if (!string.Equals(
                currency,
                "ETB",
                StringComparison.OrdinalIgnoreCase))
        {
            throw new InvalidOperationException(
                $"Unsupported payment currency returned by Chapa: {currency ?? "unknown"}.");
        }

        // Only update local payments after all important
        // verification checks have passed.
        if (string.Equals(
            finalStatus,
            "success",
            StringComparison.OrdinalIgnoreCase))
        {
            foreach (var localPayment in payments)
            {
                localPayment.Status =
                    PaymentStatus.Completed;
            }
        }
        else if (string.Equals(
            finalStatus,
            "failed",
            StringComparison.OrdinalIgnoreCase))
        {
            foreach (var localPayment in payments)
            {
                localPayment.Status =
                    PaymentStatus.Failed;
            }
        }

        await _context.SaveChangesAsync();

        // Return the first payment as the representative
        // payment response for the existing API contract.
        return await GetByIdAsync(payments[0].Id);
    }

    // =========================================================
    // INITIALIZE CHAPA PAYMENT
    // =========================================================
    public async Task<InitializeChapaPaymentResponse>
        InitializeChapaPaymentAsync(
            InitializeChapaPaymentRequest request)
    {
        var lease = await _context.Leases
            .Include(l => l.Tenant)
            .FirstOrDefaultAsync(
                l => l.Id == request.LeaseId);

        if (lease is null)
        {
            throw new InvalidOperationException(
                $"Lease with ID {request.LeaseId} was not found.");
        }

        if (request.Amount <= 0)
        {
            throw new InvalidOperationException(
                "Payment amount must be greater than 0.");
        }

        if (request.DueDate == default)
        {
            throw new InvalidOperationException(
                "Due date is required.");
        }

        if (string.IsNullOrWhiteSpace(lease.Tenant.Email))
        {
            throw new InvalidOperationException(
                "Tenant email is required for Chapa payment.");
        }

        var currentUser =
            _httpContextAccessor.HttpContext?.User;

        // Tenant can only initialize payment for their own lease.
        if (currentUser?.IsInRole("Tenant") == true)
        {
            var userIdValue =
                currentUser.FindFirstValue(
                    ClaimTypes.NameIdentifier);

            if (!int.TryParse(
                userIdValue,
                out var userId))
            {
                throw new InvalidOperationException(
                    "Authenticated user ID could not be determined.");
            }

            var tenant = await _context.Tenants
                .FirstOrDefaultAsync(
                    t => t.UserId == userId);

            if (tenant is null)
            {
                throw new InvalidOperationException(
                    "The authenticated user is not associated with a tenant.");
            }

            if (lease.TenantId != tenant.Id)
            {
                throw new UnauthorizedAccessException(
                    "You are not authorized to make a payment for this lease.");
            }
        }

        var paymentDate = DateTime.UtcNow;

        // =========================================================
        // RENT PAYMENT
        // =========================================================
        if (request.PaymentType == PaymentType.Rent)
        {
            // =====================================================
            // ADVANCE RENT PAYMENT
            // =====================================================
            if (request.RentPeriods.Count > 0)
            {
                var selectedPeriods =
                    request.RentPeriods
                        .Where(p => p.Amount > 0)
                        .ToList();

                if (selectedPeriods.Count == 0)
                {
                    throw new InvalidOperationException(
                        "At least one rent period must be selected.");
                }

                // Prevent duplicate rent periods.
                if (selectedPeriods
                    .GroupBy(p => p.DueDate)
                    .Any(g => g.Count() > 1))
                {
                    throw new InvalidOperationException(
                        "The same rent period cannot be selected more than once.");
                }

                // Calculate total selected amount.
                var selectedTotal =
                    selectedPeriods.Sum(p => p.Amount);

                // Chapa amount must exactly match
                // the selected rent periods total.
                if (selectedTotal != request.Amount)
                {
                    throw new InvalidOperationException(
                        $"Payment amount ({request.Amount:N2} ETB) must match the total selected rent periods ({selectedTotal:N2} ETB).");
                }

                // Validate every selected rent period.
                foreach (var period in selectedPeriods)
                {
                    var advanceCompletedRentAmount =
                        await GetCompletedRentAmountAsync(
                            request.LeaseId,
                            period.DueDate);

                    var advanceRemainingRent =
                        Math.Max(
                            lease.RentAmount -
                            advanceCompletedRentAmount,
                            0);

                    if (advanceRemainingRent <= 0)
                    {
                        throw new InvalidOperationException(
                            $"The rent for {period.DueDate:dd MMM yyyy} has already been fully paid.");
                    }

                    if (period.Amount > advanceRemainingRent)
                    {
                        throw new InvalidOperationException(
                            $"Payment amount for {period.DueDate:dd MMM yyyy} cannot exceed the remaining rent balance of {advanceRemainingRent:N2} ETB.");
                    }

                    // Prevent another pending Chapa payment
                    // for the same rent period.
                    var pendingAdvanceChapaPayment =
                        await _context.Payments
                            .AnyAsync(p =>
                                p.LeaseId == request.LeaseId &&
                                p.PaymentType == PaymentType.Rent &&
                                p.DueDate == period.DueDate &&
                                p.PaymentChannel == PaymentChannel.Chapa &&
                                p.Status == PaymentStatus.Pending);

                    if (pendingAdvanceChapaPayment)
                    {
                        throw new InvalidOperationException(
                            $"There is already a pending Chapa payment for the rent period {period.DueDate:dd MMM yyyy}. Please complete it before starting another payment.");
                    }
                }

                var advanceTxRef =
                    $"PROPERTYHUB-{Guid.NewGuid():N}";

                // Initialize ONE Chapa transaction for the
                // TOTAL amount of all selected rent periods.
                var advanceCheckoutUrl =
                    await _chapaPaymentService.InitializePaymentAsync(
                        amount: request.Amount,
                        email: lease.Tenant.Email,
                        firstName: lease.Tenant.FirstName,
                        lastName: lease.Tenant.LastName,
                        txRef: advanceTxRef,
                        returnUrl:
                            _configuration["Chapa:ReturnUrl"]
                            ?? throw new InvalidOperationException(
                                "Chapa ReturnUrl is not configured."),
                        callbackUrl:
                            _configuration["Chapa:CallbackUrl"]
                            ?? throw new InvalidOperationException(
                                "Chapa CallbackUrl is not configured."));

                // Create one pending Payment for each selected
                // rent period.
                var advancePayments =
                    selectedPeriods
                        .Select(period => new Payment
                        {
                            LeaseId = request.LeaseId,
                            Amount = period.Amount,
                            PaymentDate = paymentDate,
                            DueDate = period.DueDate,
                            PaymentType = PaymentType.Rent,
                            PaymentMethod = PaymentMethod.Electronic,
                            PaymentChannel = PaymentChannel.Chapa,
                            Status = PaymentStatus.Pending,
                            ChapaTransactionReference =
                                advanceTxRef,
                            CreatedAtUtc = DateTime.UtcNow
                        })
                        .ToList();

                _context.Payments.AddRange(
                    advancePayments);

                await _context.SaveChangesAsync();

                return new InitializeChapaPaymentResponse
                {
                    PaymentId = advancePayments[0].Id,
                    TxRef = advanceTxRef,
                    CheckoutUrl = advanceCheckoutUrl
                };
            }

            // =====================================================
            // NORMAL SINGLE RENT PAYMENT
            // =====================================================

            var today =
                DateOnly.FromDateTime(paymentDate);

            var singleRentYear = today.Year;
            var singleRentMonth = today.Month;

            var singleRentDueDate =
                new DateOnly(
                    singleRentYear,
                    singleRentMonth,
                    Math.Min(
                        lease.RentDueDayOfMonth,
                        DateTime.DaysInMonth(
                            singleRentYear,
                            singleRentMonth))
                );

            var singleRentCompletedAmount =
                await GetCompletedRentAmountAsync(
                    request.LeaseId,
                    singleRentDueDate);

            // If current month's rent is fully paid,
            // move to the next rent period.
            if (singleRentCompletedAmount >= lease.RentAmount)
            {
                var nextMonth =
                    today.AddMonths(1);

                singleRentYear = nextMonth.Year;
                singleRentMonth = nextMonth.Month;

                singleRentDueDate =
                    new DateOnly(
                        singleRentYear,
                        singleRentMonth,
                        Math.Min(
                            lease.RentDueDayOfMonth,
                            DateTime.DaysInMonth(
                                singleRentYear,
                                singleRentMonth))
                    );

                singleRentCompletedAmount =
                    await GetCompletedRentAmountAsync(
                        request.LeaseId,
                        singleRentDueDate);
            }

            var singleRentRemainingAmount =
                Math.Max(
                    lease.RentAmount -
                    singleRentCompletedAmount,
                    0);

            if (singleRentRemainingAmount <= 0)
            {
                throw new InvalidOperationException(
                    "The rent for this period has already been fully paid.");
            }

            if (request.Amount > singleRentRemainingAmount)
            {
                throw new InvalidOperationException(
                    $"Payment amount cannot exceed the remaining rent balance of {singleRentRemainingAmount:N2} ETB.");
            }

            // Prevent multiple pending Chapa payments
            // for the same rent period.
            var pendingSingleChapaPayment =
                await _context.Payments
                    .AnyAsync(p =>
                        p.LeaseId == request.LeaseId &&
                        p.PaymentType == PaymentType.Rent &&
                        p.DueDate == singleRentDueDate &&
                        p.PaymentChannel == PaymentChannel.Chapa &&
                        p.Status == PaymentStatus.Pending);

            if (pendingSingleChapaPayment)
            {
                throw new InvalidOperationException(
                    "There is already a pending Chapa payment for this rent period. Please complete it before starting another payment.");
            }

            var singleTxRef =
                $"PROPERTYHUB-{Guid.NewGuid():N}";

            var singleCheckoutUrl =
                await _chapaPaymentService.InitializePaymentAsync(
                    amount: request.Amount,
                    email: lease.Tenant.Email,
                    firstName: lease.Tenant.FirstName,
                    lastName: lease.Tenant.LastName,
                    txRef: singleTxRef,
                    returnUrl:
                        _configuration["Chapa:ReturnUrl"]
                        ?? throw new InvalidOperationException(
                            "Chapa ReturnUrl is not configured."),
                    callbackUrl:
                        _configuration["Chapa:CallbackUrl"]
                        ?? throw new InvalidOperationException(
                            "Chapa CallbackUrl is not configured."));

            var singlePayment = new Payment
            {
                LeaseId = request.LeaseId,
                Amount = request.Amount,
                PaymentDate = paymentDate,
                DueDate = singleRentDueDate,
                PaymentType = request.PaymentType,
                PaymentMethod = PaymentMethod.Electronic,
                PaymentChannel = PaymentChannel.Chapa,
                Status = PaymentStatus.Pending,
                ChapaTransactionReference = singleTxRef,
                CreatedAtUtc = DateTime.UtcNow
            };

            _context.Payments.Add(singlePayment);

            await _context.SaveChangesAsync();

            return new InitializeChapaPaymentResponse
            {
                PaymentId = singlePayment.Id,
                TxRef = singleTxRef,
                CheckoutUrl = singleCheckoutUrl
            };
        }

        // =========================================================
        // NON-RENT CHAPA PAYMENT
        // =========================================================

        var otherTxRef =
            $"PROPERTYHUB-{Guid.NewGuid():N}";

        var otherCheckoutUrl =
            await _chapaPaymentService.InitializePaymentAsync(
                amount: request.Amount,
                email: lease.Tenant.Email,
                firstName: lease.Tenant.FirstName,
                lastName: lease.Tenant.LastName,
                txRef: otherTxRef,
                returnUrl:
                    _configuration["Chapa:ReturnUrl"]
                    ?? throw new InvalidOperationException(
                        "Chapa ReturnUrl is not configured."),
                callbackUrl:
                    _configuration["Chapa:CallbackUrl"]
                    ?? throw new InvalidOperationException(
                        "Chapa CallbackUrl is not configured."));

        var otherPayment = new Payment
        {
            LeaseId = request.LeaseId,
            Amount = request.Amount,
            PaymentDate = paymentDate,
            DueDate = request.DueDate,
            PaymentType = request.PaymentType,
            PaymentMethod = PaymentMethod.Electronic,
            PaymentChannel = PaymentChannel.Chapa,
            Status = PaymentStatus.Pending,
            ChapaTransactionReference = otherTxRef,
            CreatedAtUtc = DateTime.UtcNow
        };

        _context.Payments.Add(otherPayment);

        await _context.SaveChangesAsync();

        return new InitializeChapaPaymentResponse
        {
            PaymentId = otherPayment.Id,
            TxRef = otherTxRef,
            CheckoutUrl = otherCheckoutUrl
        };
    }

    // =========================================================
    // VALIDATE PAYMENT
    // =========================================================
    private static void ValidatePayment(
        decimal amount,
        DateTime paymentDate,
        DateOnly dueDate,
        string? referenceNumber,
        PaymentMethod paymentMethod,
        PaymentChannel paymentChannel)
    {
        if (amount <= 0)
        {
            throw new InvalidOperationException(
                "Payment amount must be greater than 0.");
        }

        if (paymentDate == default)
        {
            throw new InvalidOperationException(
                "Payment date is required.");
        }

        if (dueDate == default)
        {
            throw new InvalidOperationException(
                "Due date is required.");
        }

        if (referenceNumber is not null &&
            referenceNumber.Length > 100)
        {
            throw new InvalidOperationException(
                "Reference number cannot exceed 100 characters.");
        }

        ValidatePaymentChannel(
            paymentMethod,
            paymentChannel);
    }

    // =========================================================
    // VALIDATE PAYMENT CHANNEL
    // =========================================================
    private static void ValidatePaymentChannel(
        PaymentMethod paymentMethod,
        PaymentChannel paymentChannel)
    {
        switch (paymentMethod)
        {
            case PaymentMethod.Cash:
            case PaymentMethod.Check:
            case PaymentMethod.CreditCard:

                if (paymentChannel != PaymentChannel.None)
                {
                    throw new InvalidOperationException(
                        $"{paymentMethod} payments must have Payment Channel set to None.");
                }

                break;

            case PaymentMethod.BankTransfer:

                if (paymentChannel != PaymentChannel.BerhanBank &&
                    paymentChannel != PaymentChannel.CommercialBankOfEthiopia)
                {
                    throw new InvalidOperationException(
                        "Bank Transfer payments must use Berhan Bank or Commercial Bank of Ethiopia.");
                }

                break;

            case PaymentMethod.Electronic:

                if (paymentChannel != PaymentChannel.Telebirr &&
                    paymentChannel != PaymentChannel.Chapa)
                {
                    throw new InvalidOperationException(
                        "Electronic payments must use Telebirr or Chapa.");
                }

                break;

            default:

                throw new InvalidOperationException(
                    "Invalid payment method.");
        }
    }

    // =========================================================
    // TENANT HELPERS
    // =========================================================
    private bool IsTenant()
    {
        return _httpContextAccessor
            .HttpContext?
            .User
            .IsInRole("Tenant") == true;
    }

    private int? GetCurrentUserId()
    {
        var userId =
            _httpContextAccessor
                .HttpContext?
                .User
                .FindFirst(
                    ClaimTypes.NameIdentifier)?
                .Value;

        return int.TryParse(
            userId,
            out var id)
            ? id
            : null;
    }
}