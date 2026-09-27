namespace PropertyManagement.Api.Services;

using PropertyManagement.Api.Entities;

public interface ITokenService
{
    string GenerateToken(User user);
    DateTime GetExpiration();
}
