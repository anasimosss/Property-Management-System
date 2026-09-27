using Microsoft.EntityFrameworkCore;
using PropertyManagement.Api.Data;
using PropertyManagement.Api.DTOs.Expenses;
using PropertyManagement.Api.Entities;

namespace PropertyManagement.Api.Services.Expenses;

public class ExpenseService : IExpenseService
{
    private readonly ApplicationDbContext _context;

    public ExpenseService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<ExpenseResponse>> GetAllAsync()
    {
        return await _context.Expenses
            .AsNoTracking()
            .Include(e => e.Property)
            .Include(e => e.Building)
            .Include(e => e.Unit)
            .Include(e => e.RecordedByUser)
            .Select(e => new ExpenseResponse
            {
                Id = e.Id,
                PropertyId = e.PropertyId,
                PropertyName = e.Property.Name,
                BuildingId = e.BuildingId,
                BuildingName = e.Building != null
                    ? e.Building.Name
                    : null,
                UnitId = e.UnitId,
                UnitNumber = e.Unit != null
                    ? e.Unit.UnitNumber
                    : null,
                RecordedByUserId = e.RecordedByUserId,
                RecordedByUserName = e.RecordedByUser.Email,
                Category = e.Category,
                Amount = e.Amount,
                ExpenseDate = e.ExpenseDate,
                VendorName = e.VendorName,
                Description = e.Description,
                ReceiptUrl = e.ReceiptUrl,
                CreatedAtUtc = e.CreatedAtUtc
            })
            .ToListAsync();
    }

    public async Task<ExpenseResponse?> GetByIdAsync(int id)
    {
        return await _context.Expenses
            .AsNoTracking()
            .Include(e => e.Property)
            .Include(e => e.Building)
            .Include(e => e.Unit)
            .Include(e => e.RecordedByUser)
            .Where(e => e.Id == id)
            .Select(e => new ExpenseResponse
            {
                Id = e.Id,
                PropertyId = e.PropertyId,
                PropertyName = e.Property.Name,
                BuildingId = e.BuildingId,
                BuildingName = e.Building != null
                    ? e.Building.Name
                    : null,
                UnitId = e.UnitId,
                UnitNumber = e.Unit != null
                    ? e.Unit.UnitNumber
                    : null,
                RecordedByUserId = e.RecordedByUserId,
                RecordedByUserName = e.RecordedByUser.Email,
                Category = e.Category,
                Amount = e.Amount,
                ExpenseDate = e.ExpenseDate,
                VendorName = e.VendorName,
                Description = e.Description,
                ReceiptUrl = e.ReceiptUrl,
                CreatedAtUtc = e.CreatedAtUtc
            })
            .FirstOrDefaultAsync();
    }

    public async Task<List<ExpenseResponse>?> GetByPropertyIdAsync(
        int propertyId)
    {
        var propertyExists = await _context.Properties
            .AnyAsync(p => p.Id == propertyId);

        if (!propertyExists)
        {
            return null;
        }

        return await _context.Expenses
            .AsNoTracking()
            .Include(e => e.Property)
            .Include(e => e.Building)
            .Include(e => e.Unit)
            .Include(e => e.RecordedByUser)
            .Where(e => e.PropertyId == propertyId)
            .Select(e => new ExpenseResponse
            {
                Id = e.Id,
                PropertyId = e.PropertyId,
                PropertyName = e.Property.Name,
                BuildingId = e.BuildingId,
                BuildingName = e.Building != null
                    ? e.Building.Name
                    : null,
                UnitId = e.UnitId,
                UnitNumber = e.Unit != null
                    ? e.Unit.UnitNumber
                    : null,
                RecordedByUserId = e.RecordedByUserId,
                RecordedByUserName = e.RecordedByUser.Email,
                Category = e.Category,
                Amount = e.Amount,
                ExpenseDate = e.ExpenseDate,
                VendorName = e.VendorName,
                Description = e.Description,
                ReceiptUrl = e.ReceiptUrl,
                CreatedAtUtc = e.CreatedAtUtc
            })
            .ToListAsync();
    }

    public async Task<ExpenseResponse?> CreateAsync(
        CreateExpenseRequest request,
        int recordedByUserId)
    {
        var propertyExists = await _context.Properties
            .AnyAsync(p => p.Id == request.PropertyId);

        if (!propertyExists)
        {
            return null;
        }

        await ValidateLocationAsync(
            request.PropertyId,
            request.BuildingId,
            request.UnitId);

        var userExists = await _context.Users
            .AnyAsync(u => u.Id == recordedByUserId);

        if (!userExists)
        {
            throw new InvalidOperationException(
                "The current user was not found.");
        }

        ValidateExpense(
            request.Amount,
            request.ExpenseDate,
            request.VendorName,
            request.Description);

        var expense = new Expense
        {
            PropertyId = request.PropertyId,
            BuildingId = request.BuildingId,
            UnitId = request.UnitId,
            RecordedByUserId = recordedByUserId,
            Category = request.Category,
            Amount = request.Amount,
            ExpenseDate = request.ExpenseDate,
            VendorName = request.VendorName.Trim(),
            Description = request.Description.Trim(),
            ReceiptUrl = string.IsNullOrWhiteSpace(request.ReceiptUrl)
                ? null
                : request.ReceiptUrl.Trim(),
            CreatedAtUtc = DateTime.UtcNow
        };

        _context.Expenses.Add(expense);
        await _context.SaveChangesAsync();

        return await GetByIdAsync(expense.Id);
    }

    public async Task<ExpenseResponse?> UpdateAsync(
        int id,
        UpdateExpenseRequest request)
    {
        var expense = await _context.Expenses
            .FirstOrDefaultAsync(e => e.Id == id);

        if (expense is null)
        {
            return null;
        }

        var propertyExists = await _context.Properties
            .AnyAsync(p => p.Id == request.PropertyId);

        if (!propertyExists)
        {
            throw new InvalidOperationException(
                $"Property with ID {request.PropertyId} was not found.");
        }

        await ValidateLocationAsync(
            request.PropertyId,
            request.BuildingId,
            request.UnitId);

        ValidateExpense(
            request.Amount,
            request.ExpenseDate,
            request.VendorName,
            request.Description);

        expense.PropertyId = request.PropertyId;
        expense.BuildingId = request.BuildingId;
        expense.UnitId = request.UnitId;
        expense.Category = request.Category;
        expense.Amount = request.Amount;
        expense.ExpenseDate = request.ExpenseDate;
        expense.VendorName = request.VendorName.Trim();
        expense.Description = request.Description.Trim();
        expense.ReceiptUrl = string.IsNullOrWhiteSpace(request.ReceiptUrl)
            ? null
            : request.ReceiptUrl.Trim();

        await _context.SaveChangesAsync();

        return await GetByIdAsync(id);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var expense = await _context.Expenses
            .FirstOrDefaultAsync(e => e.Id == id);

        if (expense is null)
        {
            return false;
        }

        _context.Expenses.Remove(expense);
        await _context.SaveChangesAsync();

        return true;
    }

    private async Task ValidateLocationAsync(
        int propertyId,
        int? buildingId,
        int? unitId)
    {
        if (buildingId.HasValue)
        {
            var building = await _context.Buildings
                .FirstOrDefaultAsync(b => b.Id == buildingId.Value);

            if (building is null)
            {
                throw new InvalidOperationException(
                    $"Building with ID {buildingId.Value} was not found.");
            }

            if (building.PropertyId != propertyId)
            {
                throw new InvalidOperationException(
                    "The selected building does not belong to the selected property.");
            }
        }

        if (unitId.HasValue)
        {
            var unit = await _context.Units
                .Include(u => u.Building)
                .FirstOrDefaultAsync(u => u.Id == unitId.Value);

            if (unit is null)
            {
                throw new InvalidOperationException(
                    $"Unit with ID {unitId.Value} was not found.");
            }

            if (unit.Building.PropertyId != propertyId)
            {
                throw new InvalidOperationException(
                    "The selected unit does not belong to the selected property.");
            }

            if (buildingId.HasValue &&
                unit.BuildingId != buildingId.Value)
            {
                throw new InvalidOperationException(
                    "The selected unit does not belong to the selected building.");
            }
        }
    }

    private static void ValidateExpense(
        decimal amount,
        DateOnly expenseDate,
        string vendorName,
        string description)
    {
        if (amount <= 0)
        {
            throw new InvalidOperationException(
                "Expense amount must be greater than 0.");
        }

        if (expenseDate == default)
        {
            throw new InvalidOperationException(
                "Expense date is required.");
        }

        if (string.IsNullOrWhiteSpace(vendorName))
        {
            throw new InvalidOperationException(
                "Vendor name is required.");
        }

        if (string.IsNullOrWhiteSpace(description))
        {
            throw new InvalidOperationException(
                "Description is required.");
        }
    }
}