using Identity.API.Models;
using Ordering.API.DTOs;

namespace Ordering.API.Services;

public interface IUserService
{
    Task<IEnumerable<UserDto>> GetAllUsersAsync(string? role = null, string? mandiId = null);
    Task<UserDto?> GetUserByIdAsync(string id);
    Task<UserDto> CreateUserAsync(CreateUserDto dto);
    Task<UserDto?> UpdateUserAsync(string id, UpdateUserDto dto);
    Task<bool> DeleteUserAsync(string id);
    Task<bool> UpdateLocationAsync(string id, string latitude, string longitude);
    Task<bool> UpdateStatusAsync(string id, string status);
}
