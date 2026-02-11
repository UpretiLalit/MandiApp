using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Ordering.API.Data;
using Ordering.API.Services;
using Ordering.API.Hubs;
using Ordering.API.Models;
using Microsoft.AspNetCore.Identity;
using Identity.API.Models;
using Ordering.Infrastructure;
using Ordering.Application.Behaviors;
using FluentValidation;
using MediatR;

var builder = WebApplication.CreateBuilder(args);

// Configure Kestrel to use PORT from environment (Render requirement)
var port = Environment.GetEnvironmentVariable("PORT") ?? "8080";
builder.WebHost.ConfigureKestrel(options =>
{
    options.ListenAnyIP(int.Parse(port));
});

// Add services to the container.
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
    });
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Database Configuration - PostgreSQL on Supabase
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<OrderingDbContext>(options =>
    options.UseNpgsql(connectionString));

// Identity Configuration
builder.Services.AddIdentity<ApplicationUser, IdentityRole>(options =>
{
    // Password settings (for development - adjust for production)
    options.Password.RequireDigit = false;
    options.Password.RequireLowercase = false;
    options.Password.RequireUppercase = false;
    options.Password.RequireNonAlphanumeric = false;
    options.Password.RequiredLength = 6;
    
    // User settings
    options.User.RequireUniqueEmail = false; // Phone is primary identifier
})
.AddEntityFrameworkStores<OrderingDbContext>()
.AddDefaultTokenProviders();

// JWT Authentication
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secretKey = jwtSettings["SecretKey"] ?? throw new InvalidOperationException("JWT SecretKey not configured");

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
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
builder.Services.AddScoped<ICartService, CartService>();
builder.Services.AddScoped<IOrderService, OrderService>();
builder.Services.AddScoped<IPaymentService, PaymentService>();
builder.Services.AddScoped<IBuyerService, BuyerService>();
builder.Services.AddScoped<IVendorService, VendorService>();
builder.Services.AddScoped<ITransporterService, TransporterService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IProductService, ProductService>();
builder.Services.AddScoped<ILogisticsService, LogisticsService>();

// Onion Architecture - Application & Infrastructure Layers
builder.Services.AddMediatR(cfg => {
    cfg.RegisterServicesFromAssembly(typeof(Ordering.Application.DTOs.OrderDto).Assembly);
});
builder.Services.AddAutoMapper(typeof(Ordering.Application.Mappers.MappingProfile).Assembly);
builder.Services.AddValidatorsFromAssembly(typeof(Ordering.Application.Commands.CreateOrder.CreateOrderCommand).Assembly);
builder.Services.AddTransient(typeof(IPipelineBehavior<,>), typeof(ValidationBehavior<,>));
builder.Services.AddInfrastructure(builder.Configuration);

// Register DbContext as generic DbContext for repository
builder.Services.AddScoped<DbContext>(provider => provider.GetRequiredService<OrderingDbContext>());

// SignalR for real-time updates
builder.Services.AddSignalR();

// CORS - Allow all origins for Render deployment
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

// Apply database migrations and seed test data
try
{
    using (var scope = app.Services.CreateScope())
    {
        var context = scope.ServiceProvider.GetRequiredService<OrderingDbContext>();
        Console.WriteLine("📊 Applying EF Core migrations...");
        
        // Use Migrate() which only creates missing tables, doesn't drop existing ones
        context.Database.Migrate();
        Console.WriteLine("✅ Migrations applied successfully");
        
        // Seed test buyers if they don't exist
        if (!await context.Buyers.AnyAsync())
        {
            Console.WriteLine("🌱 Seeding test buyers...");
            context.Buyers.AddRange(
                new Buyer
                {
                    Id = "test-buyer-001",
                    FullName = "Test Buyer",
                    PhoneNumber = "1234567890",
                    Email = "buyer@test.com",
                    BusinessAddress = "Test Business Address",
                    DeliveryAddress = "Test Delivery Address",
                    CreditLimit = 100000,
                    IsVerified = true,
                    CreatedAt = DateTime.UtcNow
                }
            );
            await context.SaveChangesAsync();
            Console.WriteLine("✅ Test buyers created");
        }
        
        // Seed test vendors if they don't exist
        if (!await context.Vendors.AnyAsync())
        {
            Console.WriteLine("🌱 Seeding test vendors...");
            context.Vendors.AddRange(
                new Vendor
                {
                    Id = "vendor-001",
                    FullName = "Vendor One",
                    PhoneNumber = "9876543210",
                    Email = "vendor1@test.com",
                    BusinessName = "Fresh Produce Co",
                    BusinessAddress = "Vendor Address 1",
                    IsVerified = true,
                    IsActive = true,
                    CommissionRate = 0.03m,
                    CreatedAt = DateTime.UtcNow
                },
                new Vendor
                {
                    Id = "vendor-002",
                    FullName = "Vendor Two",
                    PhoneNumber = "9876543211",
                    Email = "vendor2@test.com",
                    BusinessName = "Organic Farms",
                    BusinessAddress = "Vendor Address 2",
                    IsVerified = true,
                    IsActive = true,
                    CommissionRate = 0.03m,
                    CreatedAt = DateTime.UtcNow
                }
            );
            await context.SaveChangesAsync();
            Console.WriteLine("✅ Test vendors created");
        }
        
        // Test query
        var testCount = await context.Carts.CountAsync();
        Console.WriteLine($"✅ Database ready! Cart count: {testCount}");
    }
}
catch (Exception ex)
{
    Console.WriteLine($"❌ Migration failed: {ex.Message}");
}

// Configure the HTTP request pipeline.
app.UseSwagger();
app.UseSwaggerUI();

// CRITICAL: CORS must be before authentication/authorization
app.UseCors("AllowAll");

// Disable HTTPS redirection when using Cloudflare Tunnel
// app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// Map SignalR Hubs
app.MapHub<PriceHub>("/hubs/price");
app.MapHub<TrackingHub>("/hubs/tracking");

app.Run();

// Make Program accessible for testing
public partial class Program { }
