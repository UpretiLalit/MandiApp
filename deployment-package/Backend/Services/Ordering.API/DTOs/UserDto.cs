namespace Ordering.API.DTOs;

public class UserDto
{
    public string? Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string Role { get; set; } = string.Empty; // Buyer, Vendor, Transporter
    public string Status { get; set; } = "active"; // active, inactive, suspended
    
    // Mandi Assignment
    public string? AssignedMandiId { get; set; }
    public string? AssignedMandiName { get; set; }
    
    // Address Information
    public string Address { get; set; } = string.Empty;
    public string Landmark { get; set; } = string.Empty;
    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public List<string>? NearbyPlaces { get; set; }
    
    // Buyer specific
    public string? BusinessName { get; set; }
    public string? BusinessType { get; set; }
    
    // Vendor specific
    public string? StallNumber { get; set; }
    public string? MandiLocation { get; set; }
    public List<string>? Categories { get; set; }
    
    // Transporter specific
    public string? VehicleType { get; set; }
    public string? VehicleNumber { get; set; }
    public string? VehicleCapacity { get; set; }
    public string? LicenseNumber { get; set; }
    
    public DateTime CreatedAt { get; set; }
    public DateTime? LastActive { get; set; }
}

public class UpdateLocationDto
{
    public string Latitude { get; set; } = string.Empty;
    public string Longitude { get; set; } = string.Empty;
}

public class UpdateUserStatusDto
{
    public string Status { get; set; } = string.Empty;
}

public class CreateUserDto
{
    public string FullName { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string Role { get; set; } = string.Empty;
    
    // Mandi Assignment (required, cannot be changed)
    public string AssignedMandiId { get; set; } = string.Empty;
    public string AssignedMandiName { get; set; } = string.Empty;
    
    // Address Information
    public string Address { get; set; } = string.Empty;
    public string Landmark { get; set; } = string.Empty;
    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public List<string>? NearbyPlaces { get; set; }
    
    // Buyer specific
    public string? BusinessName { get; set; }
    public string? BusinessType { get; set; }
    
    // Vendor specific
    public string? StallNumber { get; set; }
    public string? MandiLocation { get; set; }
    public List<string>? Categories { get; set; }
    
    // Transporter specific
    public string? VehicleType { get; set; }
    public string? VehicleNumber { get; set; }
    public string? VehicleCapacity { get; set; }
    public string? LicenseNumber { get; set; }
}

public class UpdateUserDto
{
    public string FullName { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string? Email { get; set; }
    // Note: Role and AssignedMandiId cannot be changed after creation
    
    // Address Information
    public string Address { get; set; } = string.Empty;
    public string Landmark { get; set; } = string.Empty;
    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public List<string>? NearbyPlaces { get; set; }
    
    // Role-specific fields
    public string? BusinessName { get; set; }
    public string? BusinessType { get; set; }
    public string? StallNumber { get; set; }
    public string? MandiLocation { get; set; }
    public List<string>? Categories { get; set; }
    public string? VehicleType { get; set; }
    public string? VehicleNumber { get; set; }
    public string? VehicleCapacity { get; set; }
    public string? LicenseNumber { get; set; }
}
