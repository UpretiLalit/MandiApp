namespace Identity.API.DTOs;

public record SendOtpRequest(string PhoneNumber);

public record VerifyOtpRequest(string PhoneNumber, string Otp);

public record RegisterRequest(
    string PhoneNumber,
    string FullName,
    string Role,
    string Language = "en",
    string? Email = null,
    string? CompanyName = null,
    string? GstNumber = null,
    string? Address = null
);

public record UpdateProfileRequest(
    string? FullName = null,
    string? Email = null,
    string? CompanyName = null,
    string? GstNumber = null,
    string? Address = null
);
