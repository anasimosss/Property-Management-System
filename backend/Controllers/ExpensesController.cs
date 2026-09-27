using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PropertyManagement.Api.DTOs.Expenses;
using PropertyManagement.Api.Services.Expenses;

namespace PropertyManagement.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ExpensesController : ControllerBase
{
    private readonly IExpenseService _expenseService;

    public ExpensesController(IExpenseService expenseService)
    {
        _expenseService = expenseService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var expenses = await _expenseService.GetAllAsync();
        return Ok(expenses);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var expense = await _expenseService.GetByIdAsync(id);

        if (expense is null)
        {
            return NotFound(new
            {
                message = $"Expense with ID {id} was not found."
            });
        }

        return Ok(expense);
    }

    [HttpGet("by-property/{propertyId:int}")]
    public async Task<IActionResult> GetByPropertyId(int propertyId)
    {
        var expenses = await _expenseService.GetByPropertyIdAsync(propertyId);

        if (expenses is null)
        {
            return NotFound(new
            {
                message = $"Property with ID {propertyId} was not found."
            });
        }

        return Ok(expenses);
    }

    [HttpPost]
    [Authorize(Roles = "Admin,PropertyManager")]
    public async Task<IActionResult> Create(
        [FromBody] CreateExpenseRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (!int.TryParse(userIdClaim, out var recordedByUserId))
        {
            return Unauthorized(new
            {
                message = "The authenticated user ID could not be determined."
            });
        }

        try
        {
            var created = await _expenseService.CreateAsync(
                request,
                recordedByUserId);

            if (created is null)
            {
                return NotFound(new
                {
                    message =
                        $"Property with ID {request.PropertyId} was not found."
                });
            }

            return CreatedAtAction(
                nameof(GetById),
                new { id = created.Id },
                created);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = "Admin,PropertyManager")]
    public async Task<IActionResult> Update(
        int id,
        [FromBody] UpdateExpenseRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        try
        {
            var updated = await _expenseService.UpdateAsync(id, request);

            if (updated is null)
            {
                return NotFound(new
                {
                    message = $"Expense with ID {id} was not found."
                });
            }

            return Ok(updated);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var deleted = await _expenseService.DeleteAsync(id);

        if (!deleted)
        {
            return NotFound(new
            {
                message = $"Expense with ID {id} was not found."
            });
        }

        return NoContent();
    }
}