using Microsoft.AspNetCore.Mvc;
using Ordering.API.Services;
using Ordering.API.DTOs;

namespace Ordering.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly IUserService _userService;
    private readonly ILogger<UsersController> _logger;

    public UsersController(IUserService userService, ILogger<UsersController> logger)
    {
        _userService = userService;
        _logger = logger;
    }

    [HttpGet]
    public async Task<IActionResult> GetAllUsers(
        [FromQuery] string? role = null,
        [FromQuery] string? mandiId = null)
    {
        try
        {
            var users = await _userService.GetAllUsersAsync(role, mandiId);
            return Ok(users);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving users");
            return StatusCode(500, "An error occurred while retrieving users");
        }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetUserById(string id)
    {
        try
        {
            var user = await _userService.GetUserByIdAsync(id);
            if (user == null)
                return NotFound($"User with ID {id} not found");

            return Ok(user);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving user {UserId}", id);
            return StatusCode(500, "An error occurred while retrieving the user");
        }
    }

    [HttpPost]
    public async Task<IActionResult> CreateUser([FromBody] CreateUserDto dto)
    {
        try
        {
            var user = await _userService.CreateUserAsync(dto);
            return CreatedAtAction(nameof(GetUserById), new { id = user.Id }, user);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating user");
            return StatusCode(500, "An error occurred while creating the user");
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateUser(string id, [FromBody] UpdateUserDto dto)
    {
        try
        {
            var user = await _userService.UpdateUserAsync(id, dto);
            if (user == null)
                return NotFound($"User with ID {id} not found");

            return Ok(user);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating user {UserId}", id);
            return StatusCode(500, "An error occurred while updating the user");
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteUser(string id)
    {
        try
        {
            var success = await _userService.DeleteUserAsync(id);
            if (!success)
                return NotFound($"User with ID {id} not found");

            return Ok(new { message = "User deactivated successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting user {UserId}", id);
            return StatusCode(500, "An error occurred while deleting the user");
        }
    }

    [HttpPatch("{id}/location")]
    public async Task<IActionResult> UpdateLocation(string id, [FromBody] UpdateLocationDto dto)
    {
        try
        {
            var success = await _userService.UpdateLocationAsync(id, dto.Latitude, dto.Longitude);
            if (!success)
                return NotFound($"User with ID {id} not found");

            return Ok(new { message = "Location updated successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating location for user {UserId}", id);
            return StatusCode(500, "An error occurred while updating location");
        }
    }

    [HttpPatch("{id}/status")]
    public async Task<IActionResult> UpdateStatus(string id, [FromBody] UpdateUserStatusDto dto)
    {
        try
        {
            var success = await _userService.UpdateStatusAsync(id, dto.Status);
            if (!success)
                return NotFound($"User with ID {id} not found");

            return Ok(new { message = "Status updated successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating status for user {UserId}", id);
            return StatusCode(500, "An error occurred while updating status");
        }
    }
}
