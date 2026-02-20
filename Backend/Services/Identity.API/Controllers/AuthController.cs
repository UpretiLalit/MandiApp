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
            _logger.LogInformation("Generating OTP for phone: {PhoneNumber}", request.PhoneNumber);
            var otp = await _otpService.GenerateOtpAsync(request.PhoneNumber);
            
            _logger.LogInformation("Attempting to send OTP via WhatsApp to: {PhoneNumber}", request.PhoneNumber);
            await _otpService.SendOtpAsync(request.PhoneNumber, otp);

            _logger.LogInformation("✅ OTP sent successfully to {PhoneNumber}. OTP: {Otp}", request.PhoneNumber, otp);
            return Ok(new { message = "OTP sent successfully", phoneNumber = request.PhoneNumber });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ Error in SendOtp endpoint for {PhoneNumber}: {ErrorMessage}", request.PhoneNumber, ex.Message);
            
            // Return more specific error information
            return StatusCode(500, new 
            { 
                message = "Failed to send OTP. Please try again later.", 
                error = ex.Message,
                phoneNumber = request.PhoneNumber 
            });
        }
    }

    [HttpPost("verify-otp")]
    public async Task<IActionResult> VerifyOtp([FromBody] VerifyOtpRequest request)
    {
        _logger.LogInformation("🔍 Verifying OTP for PhoneNumber: {PhoneNumber}, OTP: {Otp}", request.PhoneNumber, request.Otp);
        
        var isValid = await _otpService.VerifyOtpAsync(request.PhoneNumber, request.Otp);

        if (!isValid)
        {
            _logger.LogWarning("❌ Invalid OTP for PhoneNumber: {PhoneNumber}, OTP: {Otp}", request.PhoneNumber, request.Otp);
            return BadRequest(new { message = "Invalid or expired OTP" });
        }

        _logger.LogInformation("✅ OTP verified successfully for {PhoneNumber}", request.PhoneNumber);
        
        var user = await _userManager.FindByNameAsync(request.PhoneNumber);

        if (user == null)
        {
            _logger.LogInformation("👤 New user detected: {PhoneNumber}", request.PhoneNumber);
            // New user - return registration required flag
            return Ok(new
            {
                isNewUser = true,
                phoneNumber = request.PhoneNumber,
                message = "Phone verified. Please complete registration."
            });
        }

        _logger.LogInformation("👤 Existing user found: {UserId}, Role: {Role}", user.Id, user.Role);
        
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
                user.Language,
                user.CompanyName
            }
        });
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        try
        {
            // Ensure phone number has country code
            var phoneWithCountryCode = request.PhoneNumber.StartsWith("+") 
                ? request.PhoneNumber 
                : $"+91{request.PhoneNumber}";
            
            _logger.LogInformation("📝 Registration request for: {PhoneNumber}, Role: {Role}", phoneWithCountryCode, request.Role);
            
            var existingUser = await _userManager.FindByNameAsync(phoneWithCountryCode);
            if (existingUser != null)
            {
                _logger.LogWarning("⚠️ User already exists: {PhoneNumber}", phoneWithCountryCode);
                return BadRequest(new { message = "User already exists" });
            }

            var user = new ApplicationUser
            {
                UserName = phoneWithCountryCode,
                PhoneNumber = phoneWithCountryCode,
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

            _logger.LogInformation("Creating user in database...");
            var result = await _userManager.CreateAsync(user);

            if (!result.Succeeded)
            {
                _logger.LogError("❌ User creation failed: {Errors}", string.Join(", ", result.Errors.Select(e => e.Description)));
                return BadRequest(new { message = "Registration failed", errors = result.Errors });
            }

            _logger.LogInformation("✅ User created successfully. Generating token...");
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
                    user.Language,
                    user.CompanyName
                }
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "💥 Registration exception for {PhoneNumber}", request.PhoneNumber);
            return StatusCode(500, new { message = "Registration failed", error = ex.Message });
        }
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

    [Authorize]
    [HttpPatch("users/language")]
    public async Task<IActionResult> UpdateLanguage([FromBody] UpdateLanguageRequest request)
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (userId == null)
            return Unauthorized();

        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
            return NotFound();

        // Validate language code
        var validLanguages = new[] { "en", "hi", "mr" };
        if (!validLanguages.Contains(request.Language?.ToLower()))
            return BadRequest(new { message = "Invalid language code. Supported: en, hi, mr" });

        user.Language = request.Language.ToLower();

        var result = await _userManager.UpdateAsync(user);

        if (!result.Succeeded)
            return BadRequest(new { message = "Language update failed", errors = result.Errors });

        return Ok(new { message = "Language updated successfully", language = user.Language });
    }
}
