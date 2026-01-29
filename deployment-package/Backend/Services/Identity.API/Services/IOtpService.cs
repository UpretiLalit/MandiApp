namespace Identity.API.Services;

public interface IOtpService
{
    Task<string> GenerateOtpAsync(string phoneNumber);
    Task<bool> VerifyOtpAsync(string phoneNumber, string otp);
    Task SendOtpAsync(string phoneNumber, string otp);
}
