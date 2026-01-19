using Identity.API.Models;

namespace Identity.API.Services;

public interface ITokenService
{
    string GenerateJwtToken(ApplicationUser user);
}
