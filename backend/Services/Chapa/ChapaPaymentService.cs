using System.Text;
using System.Text.Json;

namespace PropertyManagement.Api.Services.Chapa;

public class ChapaPaymentService
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;

    private const string ChapaInitializeUrl =
        "https://api.chapa.co/v1/transaction/initialize";

    public ChapaPaymentService(
        HttpClient httpClient,
        IConfiguration configuration)
    {
        _httpClient = httpClient;
        _configuration = configuration;
    }

    public async Task<string> InitializePaymentAsync(
        decimal amount,
        string email,
        string firstName,
        string lastName,
        string txRef,
        string returnUrl,
        string callbackUrl)
    {
        var secretKey = _configuration["Chapa:SecretKey"];

        if (string.IsNullOrWhiteSpace(secretKey))
        {
            throw new InvalidOperationException(
                "Chapa Secret Key is not configured.");
        }

        var requestBody = new
        {
            amount = amount.ToString("0.00"),
            currency = "ETB",
            email,
            first_name = firstName,
            last_name = lastName,
            tx_ref = txRef,
            return_url = returnUrl,
            callback_url = callbackUrl
        };

        var json = JsonSerializer.Serialize(requestBody);

        Console.WriteLine($"CHAPA REQUEST: {json}");

        using var request = new HttpRequestMessage(
            HttpMethod.Post,
            ChapaInitializeUrl);

        request.Headers.TryAddWithoutValidation(
            "Authorization",
            $"Bearer {secretKey}");

        request.Content = new StringContent(
            json,
            Encoding.UTF8,
            "application/json");

        using var response =
            await _httpClient.SendAsync(request);

        var responseContent =
            await response.Content.ReadAsStringAsync();

        if (!response.IsSuccessStatusCode)
        {
            throw new InvalidOperationException(
                $"Chapa API error: {responseContent}");
        }

        using var document =
            JsonDocument.Parse(responseContent);

        var checkoutUrl =
            document.RootElement
                .GetProperty("data")
                .GetProperty("checkout_url")
                .GetString();

        if (string.IsNullOrWhiteSpace(checkoutUrl))
        {
            throw new InvalidOperationException(
                "Chapa did not return a checkout URL.");
        }

        return checkoutUrl;
    }

    public async Task<string> VerifyPaymentAsync(string txRef)
    {
        var secretKey = _configuration["Chapa:SecretKey"];

        if (string.IsNullOrWhiteSpace(secretKey))
        {
            throw new InvalidOperationException(
                "Chapa Secret Key is not configured.");
        }

        var verifyUrl =
            $"https://api.chapa.co/v1/transaction/verify/{txRef}";

        using var request = new HttpRequestMessage(
            HttpMethod.Get,
            verifyUrl);

        request.Headers.TryAddWithoutValidation(
            "Authorization",
            $"Bearer {secretKey}");

        using var response =
            await _httpClient.SendAsync(request);

        var responseContent =
            await response.Content.ReadAsStringAsync();

        Console.WriteLine(
            $"CHAPA VERIFY REQUEST: {verifyUrl}");

        Console.WriteLine(
            $"CHAPA VERIFY HTTP STATUS: {(int)response.StatusCode} {response.StatusCode}");

        Console.WriteLine(
            $"CHAPA VERIFY RESPONSE: {responseContent}");

        if (!response.IsSuccessStatusCode)
        {
            throw new InvalidOperationException(
                $"Chapa verification error: {responseContent}");
        }

        return responseContent;
    }
}
