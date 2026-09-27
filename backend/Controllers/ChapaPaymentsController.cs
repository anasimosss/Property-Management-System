using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PropertyManagement.Api.Services.Chapa;
using PropertyManagement.Api.Services.Payments;

namespace PropertyManagement.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ChapaPaymentsController : ControllerBase
{
    private readonly ChapaPaymentService _chapaPaymentService;
    private readonly IPaymentService _paymentService;

    public ChapaPaymentsController(
        ChapaPaymentService chapaPaymentService,
        IPaymentService paymentService)
    {
        _chapaPaymentService = chapaPaymentService;
        _paymentService = paymentService;
    }

    // Temporary endpoint for testing Chapa initialization.
    // We can remove this after the integration is confirmed.
    [Authorize(Roles = "Admin,PropertyManager,Tenant")]
    [HttpPost("test")]
    public async Task<IActionResult> TestPayment()
    {
        try
        {
            var txRef =
                $"PROPERTYHUB-TEST-{Guid.NewGuid():N}";

            var checkoutUrl =
                await _chapaPaymentService.InitializePaymentAsync(
                    amount: 100,
                    email: "henokkebe19@gmail.com",
                    firstName: "Henok",
                    lastName: "Kebede",
                    txRef: txRef,
                    returnUrl: "http://localhost:5173/payment/success",
                    callbackUrl: "https://underrate-sharpener-colonial.ngrok-free.dev/api/ChapaPayments/callback");

            return Ok(new
            {
                message = "Chapa payment initialized successfully.",
                txRef,
                checkoutUrl
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new
            {
                message = ex.Message,
                innerMessage = ex.InnerException?.Message
            });
        }
    }

    // Manual verification endpoint for development/testing.
    [Authorize(Roles = "Admin,PropertyManager,Tenant")]
    [HttpGet("verify/{txRef}")]
    public async Task<IActionResult> VerifyPayment(string txRef)
    {
        try
        {
            var payment =
                await _paymentService.VerifyChapaPaymentAsync(txRef);

            if (payment is null)
            {
                return NotFound(new
                {
                    message =
                        $"Payment with Chapa transaction reference '{txRef}' was not found."
                });
            }

            return Ok(payment);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new
            {
                message = ex.Message
            });
        }
    }

    // Chapa calls this endpoint after the payment process.
    [AllowAnonymous]
[HttpGet("callback")]
public async Task<IActionResult> Callback(
    [FromQuery(Name = "trx_ref")] string? txRef,
    [FromQuery(Name = "ref_id")] string? refId,
    [FromQuery] string? status)
{
    if (string.IsNullOrWhiteSpace(txRef))
    {
        return BadRequest(new
        {
            message = "Transaction reference is required."
        });
    }

    try
    {
        // Do not trust the callback status directly.
        // Verify the transaction with Chapa.
        var payment =
            await _paymentService.VerifyChapaPaymentAsync(txRef);

        if (payment is null)
        {
            return NotFound(new
            {
                message =
                    $"Payment with Chapa transaction reference '{txRef}' was not found."
            });
        }

        return Ok(new
        {
            message = "Payment callback processed successfully.",
            paymentId = payment.Id,
            status = payment.Status.ToString(),
            txRef,
            refId
        });
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
