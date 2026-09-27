using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using PropertyManagement.Api.Data;
using PropertyManagement.Api.Services;
using PropertyManagement.Api.Services.Units;
using PropertyManagement.Api.Services.Tenants;
using PropertyManagement.Api.Services.Leases;
using PropertyManagement.Api.Services.Payments;
using PropertyManagement.Api.Services.Expenses;
using PropertyManagement.Api.Services.MaintenanceRequests;
using PropertyManagement.Api.Services.Dashboard;
using PropertyManagement.Api.Services.Chapa;
using PropertyManagement.Api.Services.UnitRequests;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        // Accept and produce enum values as strings
        // e.g. "Residential" instead of 0
        options.JsonSerializerOptions.Converters.Add(
            new System.Text.Json.Serialization.JsonStringEnumConverter());
    });

// Configure CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy
            .WithOrigins("http://localhost:5173")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

// Database context
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString(
            "DefaultConnection")));

// Authentication & Password Hashing Services
builder.Services.AddScoped<
    IPasswordHasherService,
    PasswordHasherService>();

builder.Services.AddScoped<
    ITokenService,
    TokenService>();

builder.Services.AddScoped<
    IDashboardService,
    DashboardService>();

// Domain Services
builder.Services.AddScoped<
    IPropertyService,
    PropertyService>();

builder.Services.AddScoped<
    IBuildingService,
    BuildingService>();

builder.Services.AddScoped<
    IUnitService,
    UnitService>();

builder.Services.AddScoped<
    ITenantService,
    TenantService>();

builder.Services.AddScoped<
    ILeaseService,
    LeaseService>();

builder.Services.AddScoped<
    IPaymentService,
    PaymentService>();

builder.Services.AddScoped<
    IExpenseService,
    ExpenseService>();

builder.Services.AddScoped<
    IMaintenanceRequestService,
    MaintenanceRequestService>();

builder.Services.AddScoped<
    IUnitRequestService,
    UnitRequestService>();

// HTTP Client / Chapa
builder.Services.AddHttpClient();

builder.Services.AddScoped<
    ChapaPaymentService>();

// HttpContext
builder.Services.AddHttpContextAccessor();

// Configure JWT Bearer Authentication
var jwtSecret =
    builder.Configuration["Jwt:Secret"]
    ?? throw new InvalidOperationException(
        "JWT Secret is not configured.");

var jwtIssuer =
    builder.Configuration["Jwt:Issuer"]
    ?? "PropertyManagementApi";

var jwtAudience =
    builder.Configuration["Jwt:Audience"]
    ?? "PropertyManagementClient";

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme =
        JwtBearerDefaults.AuthenticationScheme;

    options.DefaultChallengeScheme =
        JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters =
        new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,

            IssuerSigningKey =
                new SymmetricSecurityKey(
                    Encoding.UTF8.GetBytes(jwtSecret)),

            ValidateIssuer = true,
            ValidIssuer = jwtIssuer,

            ValidateAudience = true,
            ValidAudience = jwtAudience,

            ValidateLifetime = true,

            ClockSkew = TimeSpan.Zero
        };
});

builder.Services.AddAuthorization();

// Health checks
builder.Services.AddHealthChecks();

// OpenAPI
builder.Services.AddOpenApi(options =>
{
    options.AddDocumentTransformer(
        (document, context, cancellationToken) =>
        {
            document.Components ??=
                new Microsoft.OpenApi.OpenApiComponents();

            document.Components.SecuritySchemes ??=
                new Dictionary<
                    string,
                    Microsoft.OpenApi.IOpenApiSecurityScheme>();

            document.Components.SecuritySchemes["Bearer"] =
                new Microsoft.OpenApi.OpenApiSecurityScheme
                {
                    Type =
                        Microsoft.OpenApi.SecuritySchemeType.Http,

                    Scheme = "bearer",

                    BearerFormat = "JWT",

                    In =
                        Microsoft.OpenApi.ParameterLocation.Header,

                    Description =
                        "Enter JWT Bearer token"
                };

            document.Security ??=
                new List<
                    Microsoft.OpenApi.OpenApiSecurityRequirement>();

            document.Security.Add(
                new Microsoft.OpenApi.OpenApiSecurityRequirement
                {
                    [
                        new Microsoft.OpenApi
                            .OpenApiSecuritySchemeReference(
                                "Bearer",
                                document)
                    ] = new List<string>()
                });

            return Task.CompletedTask;
        });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
}

app.UseHttpsRedirection();

// Enable CORS
app.UseCors("AllowReactApp");

// Enable Authentication & Authorization
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.MapHealthChecks("/health");

app.Run();