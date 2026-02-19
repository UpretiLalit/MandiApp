using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Identity.API.Data;
using Identity.API.Models;
using Identity.API.Services;

var builder = WebApplication.CreateBuilder(args);

// Configure Kestrel to use PORT from environment (Render requirement)
var port = Environment.GetEnvironmentVariable("PORT") ?? "8080";
builder.WebHost.ConfigureKestrel(options =>
{
    options.ListenAnyIP(int.Parse(port));
});

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Database Configuration
builder.Services.AddDbContext<IdentityDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// Identity Configuration
builder.Services.AddIdentity<ApplicationUser, IdentityRole>(options =>
{
    options.Password.RequireDigit = true;
    options.Password.RequiredLength = 6;
    options.Password.RequireNonAlphanumeric = false;
    options.Password.RequireUppercase = false;
    options.Password.RequireLowercase = false;
})
.AddEntityFrameworkStores<IdentityDbContext>()
.AddDefaultTokenProviders();

// JWT Authentication
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secretKey = jwtSettings["SecretKey"] ?? throw new InvalidOperationException("JWT SecretKey not configured");

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings["Issuer"],
        ValidAudience = jwtSettings["Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey))
    };
});

// Custom Services
builder.Services.AddScoped<ITokenService, TokenService>();
builder.Services.AddScoped<IOtpService, OtpService>();

// CORS - Allow specific origins including localhost for development
var allowedOrigins = builder.Configuration.GetSection("AllowedOrigins").Get<string[]>() 
    ?? new[] { "http://localhost:4200", "http://localhost:8100" };

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.WithOrigins(allowedOrigins)
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
    
    // Fallback policy for development
    options.AddPolicy("AllowAllOrigins", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

// Auto-migrate database on startup
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<IdentityDbContext>();
    var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
    
    try
    {
        logger.LogInformation("📊 Checking database schema...");
        
        // Add Language column if it doesn't exist
        var sql = @"
            DO $$ 
            BEGIN 
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'AspNetUsers' AND column_name = 'Language'
                ) THEN
                    ALTER TABLE ""AspNetUsers"" 
                    ADD COLUMN ""Language"" VARCHAR(10) NOT NULL DEFAULT 'en';
                    RAISE NOTICE 'Language column added';
                END IF;
            END $$;
        ";
        
        dbContext.Database.ExecuteSqlRaw(sql);
        logger.LogInformation("✅ Database schema updated successfully");
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "❌ Failed to update database schema");
    }
}

// Configure the HTTP request pipeline.
// Enable Swagger in all environments for testing
app.UseSwagger();
app.UseSwaggerUI();

// CORS must be before Authentication and Authorization
app.UseCors("AllowAll");

// Disable HTTPS redirection when using Cloudflare Tunnel
// app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// Log configuration on startup
var startupLogger = app.Services.GetRequiredService<ILogger<Program>>();
startupLogger.LogInformation("🚀 Identity API starting...");
startupLogger.LogInformation("🔧 Dev Bypass: {DevBypass}", app.Configuration.GetValue<bool>("OtpSettings:EnableDevBypass"));
startupLogger.LogInformation("🔧 Disable OTP Sending: {DisableSending}", app.Configuration.GetValue<bool>("OtpSettings:DisableSending"));
startupLogger.LogInformation("🌐 Allowed Origins: {Origins}", string.Join(", ", app.Configuration.GetSection("AllowedOrigins").Get<string[]>() ?? Array.Empty<string>()));

app.Run();
