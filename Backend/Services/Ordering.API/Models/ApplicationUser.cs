using Microsoft.AspNetCore.Identity;

namespace Identity.API.Models;

public class ApplicationUser : IdentityUser
{
    public string FullName { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty; // Buyer, Vendor, Transporter, Admin
    
    // Mandi Assignment (immutable after creation)
    public string? AssignedMandiId { get; set; }
    public string? AssignedMandiName { get; set; }
    
    // Address Information
    public string? Address { get; set; }
    public string? Landmark { get; set; }
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
    public string? NearbyPlaces { get; set; } // JSON array stored as string
    
    // Business Information
    public string? CompanyName { get; set; }
    public string? GstNumber { get; set; }
    
    // Buyer specific
    public string? BusinessName { get; set; }
    public string? BusinessType { get; set; }
    
    // Vendor specific
    public string? StallNumber { get; set; }
    public string? MandiLocation { get; set; }
    public string? Categories { get; set; } // JSON array stored as string
    
    // Transporter specific
    public string? VehicleType { get; set; }
    public string? VehicleNumber { get; set; }
    public string? VehicleCapacity { get; set; }
    public string? LicenseNumber { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? LastLoginAt { get; set; }
    public bool IsActive { get; set; } = true;
    public string Status { get; set; } = "active"; // active, inactive, suspended
}
