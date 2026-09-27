using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PropertyManagement.Api.DTOs.Payments;
using PropertyManagement.Api.Services.Payments;

namespace PropertyManagement.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PaymentsController : ControllerBase
{
    private readonly IPaymentService _paymentService;

    public PaymentsController(IPaymentService paymentService)
    {
        _paymentService = paymentService;
    }

   [HttpGet]
[Authorize(Roles = "Admin,PropertyManager,Tenant")]
public async Task<IActionResult> GetAll()
    {
        var payments = await _paymentService.GetAllAsync();
        return Ok(payments);
    }

    [HttpGet("{id:int}")]
[Authorize(Roles = "Admin,PropertyManager,Tenant")]
public async Task<IActionResult> GetById(int id)
    {
        var payment = await _paymentService.GetByIdAsync(id);

        if (payment is null)
        {
            return NotFound(new
            {
                message = $"Payment with ID {id} was not found."
            });
        }

        return Ok(payment);
    }

   [HttpGet("by-lease/{leaseId:int}")]
[Authorize(Roles = "Admin,PropertyManager,Tenant")]
public async Task<IActionResult> GetByLeaseId(int leaseId)
    {
        var payments = await _paymentService.GetByLeaseIdAsync(leaseId);

        if (payments is null)
        {
            return NotFound(new
            {
                message = $"Lease with ID {leaseId} was not found."
            });
        }

        return Ok(payments);
    }

    [HttpPost]
    [Authorize(Roles = "Admin,PropertyManager")]
    public async Task<IActionResult> Create(
        [FromBody] CreatePaymentRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        try
        {
            var created = await _paymentService.CreateAsync(request);

            if (created is null)
            {
                return NotFound(new
                {
                    message = $"Lease with ID {request.LeaseId} was not found."
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
        [FromBody] UpdatePaymentRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        try
        {
            var updated = await _paymentService.UpdateAsync(id, request);

            if (updated is null)
            {
                return NotFound(new
                {
                    message = $"Payment with ID {id} was not found."
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
        var deleted = await _paymentService.DeleteAsync(id);

        if (!deleted)
        {
            return NotFound(new
            {
                message = $"Payment with ID {id} was not found."
            });
        }

        return NoContent();
    }

    [HttpPost("chapa/initialize")]
    [Authorize(Roles = "Admin,PropertyManager,Tenant")]
    public async Task<IActionResult> InitializeChapaPayment(
        [FromBody] InitializeChapaPaymentRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }
    
        try
        {
            var result =
                await _paymentService.InitializeChapaPaymentAsync(request);

            return Ok(result);
    }
    catch (UnauthorizedAccessException)
    {
        return Forbid();
    }
    catch (InvalidOperationException ex)
    {
        return BadRequest(new
        {
            message = ex.Message
        });
    }
}

[HttpGet("my-rent")]
[Authorize(Roles = "Tenant")]
public async Task<IActionResult> GetMyRent()
{
    var rent = await _paymentService.GetMyRentAsync();

    if (rent is null)
        return NotFound(new { message = "No active lease was found for this tenant." });

    return Ok(rent);
}

[HttpGet("rent-periods")]
[Authorize(Roles = "Tenant")]
public async Task<IActionResult> GetRentPaymentPeriods(
    [FromQuery] int months = 3)
{
    try
    {
        var periods =
            await _paymentService.GetRentPaymentPeriodsAsync(months);

        return Ok(periods);
    }
    catch (InvalidOperationException ex)
    {
        return BadRequest(new
        {
            message = ex.Message
        });
    }
}
}