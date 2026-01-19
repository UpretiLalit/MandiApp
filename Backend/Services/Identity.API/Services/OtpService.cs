using Identity.API.Data;
using Identity.API.Models;
using Microsoft.EntityFrameworkCore;

namespace Identity.API.Services;

public class OtpService : IOtpService
{
    private readonly IdentityDbContext _context;
    private readonly IConfiguration _configuration;
    private readonly ILogger<OtpService> _logger;

    public OtpService(IdentityDbContext context, IConfiguration configuration, ILogger<OtpService> logger)
    {
        _context = context;
        _configuration = configuration;
        _logger = logger;
    }

    public async Task<string> GenerateOtpAsync(string phoneNumber)
    {
        // Generate 6-digit OTP
        var random = new Random();
        var otp = random.Next(100000, 999999).ToString();

        var expiryMinutes = _configuration.GetValue<int>("OtpSettings:ExpiryInMinutes", 5);

        var otpVerification = new OtpVerification
        {
            PhoneNumber = phoneNumber,
            OtpCode = otp,
            CreatedAt = DateTime.UtcNow,
            ExpiresAt = DateTime.UtcNow.AddMinutes(expiryMinutes),
            IsVerified = false,
            Attempts = 0
        };

        _context.OtpVerifications.Add(otpVerification);
        await _context.SaveChangesAsync();

        return otp;
    }

    public async Task<bool> VerifyOtpAsync(string phoneNumber, string otp)
    {
        var otpRecord = await _context.OtpVerifications
            .Where(o => o.PhoneNumber == phoneNumber && o.OtpCode == otp && !o.IsVerified)
            .OrderByDescending(o => o.CreatedAt)
            .FirstOrDefaultAsync();

        if (otpRecord == null)
            return false;

        otpRecord.Attempts++;

        if (otpRecord.ExpiresAt < DateTime.UtcNow)
        {
            await _context.SaveChangesAsync();
            return false;
        }

        var maxAttempts = _configuration.GetValue<int>("OtpSettings:MaxAttempts", 3);
        if (otpRecord.Attempts > maxAttempts)
        {
            await _context.SaveChangesAsync();
            return false;
        }

        otpRecord.IsVerified = true;
        await _context.SaveChangesAsync();

        return true;
    }

    public async Task SendOtpAsync(string phoneNumber, string otp)
    {
        // TODO: Integrate with SMS service provider (Twilio, AWS SNS, etc.)
        _logger.LogInformation($"Sending OTP {otp} to {phoneNumber}");
        await Task.CompletedTask;
    }
}
