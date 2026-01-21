using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Identity.API.Models;
using Identity.API.Services;
using Identity.API.DTOs;

namespace Identity.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly ITokenService _tokenService;
    private readonly IOtpService _otpService;
    private readonly ILogger<AuthController> _logger;

    public AuthController(
        UserManager<ApplicationUser> userManager,
        ITokenService tokenService,
        IOtpService otpService,
        ILogger<AuthController> logger)
    {
        _userManager = userManager;
        _tokenService = tokenService;
        _otpService = otpService;
        _logger = logger;
    }

    [HttpPost("send-otp")]
    public async Task<IActionResult> SendOtp([FromBody] SendOtpRequest request)
    {
        try
        {
            var otp = await _otpService.GenerateOtpAsync(request.PhoneNumber);
            await _otpService.SendOtpAsync(request.PhoneNumber, otp);

            return Ok(new { message = "OTP sent successfully", phoneNumber = request.PhoneNumber });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending OTP");
            return StatusCode(500, new { message = "Failed to send OTP" });
        }
    }

    [HttpPost("verify-otp")]
    public async Task<IActionResult> VerifyOtp([FromBody] VerifyOtpRequest request)
    {
        var isValid = await _otpService.VerifyOtpAsync(request.PhoneNumber, request.Otp);

        if (!isValid)
            return BadRequest(new { message = "Invalid or expired OTP" });

        var user = await _userManager.FindByNameAsync(request.PhoneNumber);

        if (user == null)
        {
            // New user - return registration required flag
            return Ok(new
            {
                isNewUser = true,
                phoneNumber = request.PhoneNumber,
                message = "Phone verified. Please complete registration."
            });
        }

        // Existing user - generate token
        user.LastLoginAt = DateTime.UtcNow;
        await _userManager.UpdateAsync(user);

        var token = _tokenService.GenerateJwtToken(user);

        return Ok(new
        {
            isNewUser = false,
            token,
            user = new
            {
                user.Id,
                user.FullName,
                user.PhoneNumber,
                user.Email,
                user.Role,
                user.CompanyName
            }
        });
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        var existingUser = await _userManager.FindByNameAsync(request.PhoneNumber);
        if (existingUser != null)
            return BadRequest(new { message = "User already exists" });

        var user = new ApplicationUser
        {
            UserName = request.PhoneNumber,
            PhoneNumber = request.PhoneNumber,
            Email = request.Email,
            FullName = request.FullName,
            Role = request.Role,
            Language = request.Language ?? "en",
            CompanyName = request.CompanyName,
            GstNumber = request.GstNumber,
            Address = request.Address,
            PhoneNumberConfirmed = true,
            IsActive = true
        };

        var result = await _userManager.CreateAsync(user);

        if (!result.Succeeded)
            return BadRequest(new { message = "Registration failed", errors = result.Errors });

        var token = _tokenService.GenerateJwtToken(user);

        return Ok(new
        {
            message = "Registration successful",
            token,
            user = new
            {
                user.Id,
                user.FullName,
                user.PhoneNumber,
                user.Email,
                user.Role,
                user.CompanyName
            }
        });
    }

    [Authorize]
    [HttpGet("profile")]
    public async Task<IActionResult> GetProfile()
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (userId == null)
            return Unauthorized();

        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
            return NotFound();

        return Ok(new
        {
            user.Id,
            user.FullName,
            user.PhoneNumber,
            user.Email,
            user.Role,
            user.CompanyName,
            user.GstNumber,
            user.Address,
            user.CreatedAt,
            user.LastLoginAt
        });
    }

    [Authorize]
    [HttpPut("profile")]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequest request)
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (userId == null)
            return Unauthorized();

        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
            return NotFound();

        user.FullName = request.FullName ?? user.FullName;
        user.Email = request.Email ?? user.Email;
        user.CompanyName = request.CompanyName ?? user.CompanyName;
        user.GstNumber = request.GstNumber ?? user.GstNumber;
        user.Address = request.Address ?? user.Address;

        var result = await _userManager.UpdateAsync(user);

        if (!result.Succeeded)
            return BadRequest(new { message = "Update failed", errors = result.Errors });

        return Ok(new { message = "Profile updated successfully" });
    }
}
