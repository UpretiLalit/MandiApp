using Identity.API.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Ordering.API.DTOs;
using System.Text.Json;

namespace Ordering.API.Services;

public class UserService : IUserService
{
    private readonly UserManager<ApplicationUser> _userManager;

    public UserService(UserManager<ApplicationUser> userManager)
    {
        _userManager = userManager;
    }

    public async Task<IEnumerable<UserDto>> GetAllUsersAsync(string? role = null, string? mandiId = null)
    {
        var query = _userManager.Users.AsQueryable();

        if (!string.IsNullOrEmpty(role))
            query = query.Where(u => u.Role == role);

        if (!string.IsNullOrEmpty(mandiId))
            query = query.Where(u => u.AssignedMandiId == mandiId);

        var users = await query.ToListAsync();
        return users.Select(MapToDto);
    }

    public async Task<UserDto?> GetUserByIdAsync(string id)
    {
        var user = await _userManager.FindByIdAsync(id);
        return user == null ? null : MapToDto(user);
    }

    public async Task<UserDto> CreateUserAsync(CreateUserDto dto)
    {
        var existingUser = await _userManager.Users
            .FirstOrDefaultAsync(u => u.PhoneNumber == dto.PhoneNumber);

        if (existingUser != null)
            throw new InvalidOperationException("User with this phone number already exists");

        var newUser = new ApplicationUser
        {
            UserName = dto.PhoneNumber,
            PhoneNumber = dto.PhoneNumber,
            Email = dto.Email,
            FullName = dto.FullName,
            Role = dto.Role,
            AssignedMandiId = dto.AssignedMandiId,
            AssignedMandiName = dto.AssignedMandiName,
            Address = dto.Address,
            Landmark = dto.Landmark,
            Latitude = dto.Latitude,
            Longitude = dto.Longitude,
            NearbyPlaces = dto.NearbyPlaces != null ? JsonSerializer.Serialize(dto.NearbyPlaces) : null,
            BusinessName = dto.BusinessName,
            BusinessType = dto.BusinessType,
            StallNumber = dto.StallNumber,
            MandiLocation = dto.MandiLocation,
            Categories = dto.Categories != null ? JsonSerializer.Serialize(dto.Categories) : null,
            VehicleType = dto.VehicleType,
            VehicleNumber = dto.VehicleNumber,
            VehicleCapacity = dto.VehicleCapacity,
            LicenseNumber = dto.LicenseNumber,
            CreatedAt = DateTime.UtcNow,
            IsActive = true,
            Status = "active"
        };

        var result = await _userManager.CreateAsync(newUser, "DefaultPassword123!");
        if (!result.Succeeded)
            throw new InvalidOperationException($"User creation failed: {string.Join(", ", result.Errors.Select(e => e.Description))}");

        return MapToDto(newUser);
    }

    public async Task<UserDto?> UpdateUserAsync(string id, UpdateUserDto dto)
    {
        var user = await _userManager.FindByIdAsync(id);
        if (user == null)
            return null;

        user.FullName = dto.FullName;
        user.PhoneNumber = dto.PhoneNumber;
        user.Email = dto.Email;
        user.Address = dto.Address;
        user.Landmark = dto.Landmark;
        user.Latitude = dto.Latitude;
        user.Longitude = dto.Longitude;
        user.NearbyPlaces = dto.NearbyPlaces != null ? JsonSerializer.Serialize(dto.NearbyPlaces) : null;
        user.BusinessName = dto.BusinessName;
        user.BusinessType = dto.BusinessType;
        user.StallNumber = dto.StallNumber;
        user.MandiLocation = dto.MandiLocation;
        user.Categories = dto.Categories != null ? JsonSerializer.Serialize(dto.Categories) : null;
        user.VehicleType = dto.VehicleType;
        user.VehicleNumber = dto.VehicleNumber;
        user.VehicleCapacity = dto.VehicleCapacity;
        user.LicenseNumber = dto.LicenseNumber;

        var result = await _userManager.UpdateAsync(user);
        if (!result.Succeeded)
            throw new InvalidOperationException($"User update failed: {string.Join(", ", result.Errors.Select(e => e.Description))}");

        return MapToDto(user);
    }

    public async Task<bool> DeleteUserAsync(string id)
    {
        var user = await _userManager.FindByIdAsync(id);
        if (user == null)
            return false;

        user.IsActive = false;
        user.Status = "deleted";
        var result = await _userManager.UpdateAsync(user);
        return result.Succeeded;
    }

    public async Task<bool> UpdateLocationAsync(string id, string latitude, string longitude)
    {
        var user = await _userManager.FindByIdAsync(id);
        if (user == null)
            return false;

        if (double.TryParse(latitude, out var lat))
            user.Latitude = lat;
        
        if (double.TryParse(longitude, out var lon))
            user.Longitude = lon;

        var result = await _userManager.UpdateAsync(user);
        return result.Succeeded;
    }

    public async Task<bool> UpdateStatusAsync(string id, string status)
    {
        var user = await _userManager.FindByIdAsync(id);
        if (user == null)
            return false;

        user.Status = status;
        var result = await _userManager.UpdateAsync(user);
        return result.Succeeded;
    }

    private UserDto MapToDto(ApplicationUser user)
    {
        return new UserDto
        {
            Id = user.Id,
            FullName = user.FullName,
            PhoneNumber = user.PhoneNumber ?? string.Empty,
            Email = user.Email,
            Role = user.Role,
            Status = user.Status,
            AssignedMandiId = user.AssignedMandiId,
            AssignedMandiName = user.AssignedMandiName,
            Address = user.Address ?? string.Empty,
            Landmark = user.Landmark ?? string.Empty,
            Latitude = user.Latitude ?? 0,
            Longitude = user.Longitude ?? 0,
            NearbyPlaces = !string.IsNullOrEmpty(user.NearbyPlaces)
                ? JsonSerializer.Deserialize<List<string>>(user.NearbyPlaces)
                : null,
            BusinessName = user.BusinessName,
            BusinessType = user.BusinessType,
            StallNumber = user.StallNumber,
            MandiLocation = user.MandiLocation,
            Categories = !string.IsNullOrEmpty(user.Categories)
                ? JsonSerializer.Deserialize<List<string>>(user.Categories)
                : null,
            VehicleType = user.VehicleType,
            VehicleNumber = user.VehicleNumber,
            VehicleCapacity = user.VehicleCapacity,
            LicenseNumber = user.LicenseNumber,
            CreatedAt = user.CreatedAt,
            LastActive = user.LastLoginAt
        };
    }
}
