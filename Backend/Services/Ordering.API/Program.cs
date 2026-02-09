using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Ordering.API.Data;
using Ordering.API.Services;
using Ordering.API.Hubs;
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

// Apply database migrations with error handling
try
{
    using (var scope = app.Services.CreateScope())
    {
        var context = scope.ServiceProvider.GetRequiredService<OrderingDbContext>();
        Console.WriteLine("📊 Creating Ordering tables...");
        
        // Create tables manually if they don't exist (Identity tables already exist)
        await context.Database.ExecuteSqlRawAsync(@"
            CREATE TABLE IF NOT EXISTS ""Carts"" (
                ""Id"" SERIAL PRIMARY KEY,
                ""BuyerId"" TEXT NOT NULL,
                ""CreatedAt"" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
                ""UpdatedAt"" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
            );
            
            CREATE TABLE IF NOT EXISTS ""CartItems"" (
                ""Id"" SERIAL PRIMARY KEY,
                ""CartId"" INTEGER NOT NULL REFERENCES ""Carts""(""Id"") ON DELETE CASCADE,
                ""ProductId"" TEXT NOT NULL,
                ""ProductName"" TEXT NOT NULL,
                ""VendorId"" TEXT NOT NULL,
                ""Quantity"" INTEGER NOT NULL,
                ""UnitPrice"" DECIMAL(18,2) NOT NULL
            );
            
            CREATE TABLE IF NOT EXISTS ""Buyers"" (
                ""Id"" TEXT PRIMARY KEY,
                ""FullName"" TEXT NOT NULL,
                ""PhoneNumber"" TEXT NOT NULL,
                ""Email"" TEXT,
                ""CompanyName"" TEXT,
                ""GstNumber"" TEXT,
                ""BusinessAddress"" TEXT NOT NULL,
                ""DeliveryAddress"" TEXT NOT NULL,
                ""CreditLimit"" DECIMAL(18,2) NOT NULL DEFAULT 0,
                ""OutstandingBalance"" DECIMAL(18,2) NOT NULL DEFAULT 0,
                ""IsVerified"" BOOLEAN NOT NULL DEFAULT false,
                ""CreatedAt"" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
                ""LastOrderAt"" TIMESTAMP WITH TIME ZONE
            );
            
            CREATE TABLE IF NOT EXISTS ""Vendors"" (
                ""Id"" TEXT PRIMARY KEY,
                ""FullName"" TEXT NOT NULL,
                ""PhoneNumber"" TEXT NOT NULL,
                ""Email"" TEXT,
                ""BusinessName"" TEXT NOT NULL,
                ""GstNumber"" TEXT,
                ""FssaiLicense"" TEXT,
                ""BusinessAddress"" TEXT NOT NULL,
                ""Latitude"" TEXT,
                ""Longitude"" TEXT,
                ""IsVerified"" BOOLEAN NOT NULL DEFAULT false,
                ""IsActive"" BOOLEAN NOT NULL DEFAULT true,
                ""CommissionRate"" DECIMAL(5,4) NOT NULL DEFAULT 0.05,
                ""TotalEarnings"" DECIMAL(18,2) NOT NULL DEFAULT 0,
                ""TotalOrders"" INTEGER NOT NULL DEFAULT 0,
                ""Rating"" DECIMAL(3,2) NOT NULL DEFAULT 0,
                ""RatingCount"" INTEGER NOT NULL DEFAULT 0,
                ""CreatedAt"" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
                ""LastActiveAt"" TIMESTAMP WITH TIME ZONE
            );
            
            CREATE TABLE IF NOT EXISTS ""Transporters"" (
                ""Id"" TEXT PRIMARY KEY,
                ""FullName"" TEXT NOT NULL,
                ""PhoneNumber"" TEXT NOT NULL,
                ""Email"" TEXT,
                ""VehicleNumber"" TEXT NOT NULL,
                ""VehicleType"" INTEGER NOT NULL,
                ""DrivingLicense"" TEXT,
                ""VehicleRC"" TEXT,
                ""IsVerified"" BOOLEAN NOT NULL DEFAULT false,
                ""IsAvailable"" BOOLEAN NOT NULL DEFAULT true,
                ""CurrentLatitude"" TEXT,
                ""CurrentLongitude"" TEXT,
                ""LastLocationUpdateAt"" TIMESTAMP WITH TIME ZONE,
                ""TotalEarnings"" DECIMAL(18,2) NOT NULL DEFAULT 0,
                ""TotalDeliveries"" INTEGER NOT NULL DEFAULT 0,
                ""Rating"" DECIMAL(3,2) NOT NULL DEFAULT 0,
                ""RatingCount"" INTEGER NOT NULL DEFAULT 0,
                ""CreatedAt"" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
                ""LastActiveAt"" TIMESTAMP WITH TIME ZONE
            );
            
            CREATE TABLE IF NOT EXISTS ""Orders"" (
                ""Id"" SERIAL PRIMARY KEY,
                ""OrderNumber"" TEXT NOT NULL UNIQUE,
                ""BuyerId"" TEXT NOT NULL,
                ""VendorId"" TEXT NOT NULL,
                ""TransporterId"" TEXT,
                ""Status"" INTEGER NOT NULL,
                ""PaymentStatus"" INTEGER NOT NULL,
                ""TotalAmount"" DECIMAL(18,2) NOT NULL,
                ""DeliveryAddress"" TEXT NOT NULL,
                ""DeliveryLatitude"" TEXT,
                ""DeliveryLongitude"" TEXT,
                ""EstimatedDeliveryTime"" TIMESTAMP WITH TIME ZONE,
                ""ActualDeliveryTime"" TIMESTAMP WITH TIME ZONE,
                ""Notes"" TEXT,
                ""CreatedAt"" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
                ""UpdatedAt"" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
            );
            
            CREATE TABLE IF NOT EXISTS ""OrderItems"" (
                ""Id"" SERIAL PRIMARY KEY,
                ""OrderId"" INTEGER NOT NULL REFERENCES ""Orders""(""Id"") ON DELETE CASCADE,
                ""ProductId"" TEXT NOT NULL,
                ""ProductName"" TEXT NOT NULL,
                ""VendorId"" TEXT NOT NULL,
                ""Quantity"" INTEGER NOT NULL,
                ""UnitPrice"" DECIMAL(18,2) NOT NULL,
                ""TotalPrice"" DECIMAL(18,2) NOT NULL
            );
            
            CREATE TABLE IF NOT EXISTS ""Payments"" (
                ""Id"" SERIAL PRIMARY KEY,
                ""OrderId"" INTEGER NOT NULL REFERENCES ""Orders""(""Id""),
                ""Amount"" DECIMAL(18,2) NOT NULL,
                ""PaymentMethod"" INTEGER NOT NULL,
                ""Status"" INTEGER NOT NULL,
                ""TransactionId"" TEXT,
                ""PaymentGatewayResponse"" TEXT,
                ""CreatedAt"" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
                ""UpdatedAt"" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
            );
            
            CREATE INDEX IF NOT EXISTS ""IX_Carts_BuyerId"" ON ""Carts""(""BuyerId"");
            CREATE INDEX IF NOT EXISTS ""IX_Orders_BuyerId"" ON ""Orders""(""BuyerId"");
            CREATE INDEX IF NOT EXISTS ""IX_Orders_VendorId"" ON ""Orders""(""VendorId"");
        ");
        
        Console.WriteLine("✅ All Ordering tables created successfully");
        
        // Verify
        var cartsCount = await context.Carts.CountAsync();
        Console.WriteLine($"✅ Carts table accessible with {cartsCount} records");
    }
}
catch (Exception ex)
{
    Console.WriteLine($"⚠️ Database setup failed: {ex.Message}");
    Console.WriteLine($"Stack trace: {ex.StackTrace}");
    Console.WriteLine("⚠️ Service will continue but database operations may fail");
}

// Configure the HTTP request pipeline.
app.UseSwagger();
app.UseSwaggerUI();

// Disable HTTPS redirection when using Cloudflare Tunnel
// app.UseHttpsRedirection();
app.UseCors("AllowAll");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// Map SignalR Hubs
app.MapHub<PriceHub>("/hubs/price");
app.MapHub<TrackingHub>("/hubs/tracking");

app.Run();

// Make Program accessible for testing
public partial class Program { }
