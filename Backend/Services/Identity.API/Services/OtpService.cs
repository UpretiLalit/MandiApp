using Identity.API.Data;
using Identity.API.Models;
using Microsoft.EntityFrameworkCore;
using Twilio;
using Twilio.Rest.Api.V2010.Account;
using Twilio.Types;

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
        try
        {
            _logger.LogInformation("Generating OTP for {PhoneNumber}", phoneNumber);
            
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

            _logger.LogInformation("Saving OTP to database for {PhoneNumber}", phoneNumber);
            _context.OtpVerifications.Add(otpVerification);
            await _context.SaveChangesAsync();
            
            _logger.LogInformation("✅ OTP generated and saved: {Otp} for {PhoneNumber}", otp, phoneNumber);
            return otp;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ Failed to generate OTP for {PhoneNumber}: {ErrorMessage}", phoneNumber, ex.Message);
            throw;
        }
    }

    public async Task<bool> VerifyOtpAsync(string phoneNumber, string otp)
    {
        // Check if dev bypass is enabled in configuration
        var enableDevBypass = _configuration.GetValue<bool>("OtpSettings:EnableDevBypass", false);
        
        if (enableDevBypass && otp == "123456")
        {
            _logger.LogWarning("🔓 DEV BYPASS MODE: Accepting OTP 123456 for {PhoneNumber}", phoneNumber);
            return true;
        }
        
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
        try
        {
            var accountSid = _configuration["TwilioSettings:AccountSid"];
            var authToken = _configuration["TwilioSettings:AuthToken"];
            var whatsappFrom = _configuration["TwilioSettings:WhatsAppFrom"];

            if (string.IsNullOrEmpty(accountSid) || string.IsNullOrEmpty(authToken))
            {
                _logger.LogWarning("Twilio credentials not configured. OTP: {Otp} for {PhoneNumber}", otp, phoneNumber);
                return;
            }

            // Initialize Twilio client
            Twilio.TwilioClient.Init(accountSid, authToken);

            // Format phone number for WhatsApp (must include country code with +)
            var toNumber = phoneNumber.StartsWith("+") ? $"whatsapp:{phoneNumber}" : $"whatsapp:+{phoneNumber}";
            
            var message = await Twilio.Rest.Api.V2010.Account.MessageResource.CreateAsync(
                body: $"Your MandiApp verification code is: {otp}. Valid for 5 minutes.",
                from: new Twilio.Types.PhoneNumber(whatsappFrom),
                to: new Twilio.Types.PhoneNumber(toNumber)
            );

            _logger.LogInformation("WhatsApp OTP sent successfully. SID: {MessageSid}, To: {PhoneNumber}", message.Sid, phoneNumber);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send OTP via Twilio WhatsApp to {PhoneNumber}", phoneNumber);
            // Don't throw - let the OTP still be generated and stored in DB for manual verification
        }
    }
}
