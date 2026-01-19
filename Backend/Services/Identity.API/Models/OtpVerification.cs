namespace Identity.API.Models;

public class OtpVerification
{
    public int Id { get; set; }
    public string PhoneNumber { get; set; } = string.Empty;
    public string OtpCode { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime ExpiresAt { get; set; }
    public bool IsVerified { get; set; }
    public int Attempts { get; set; } = 0;
}
