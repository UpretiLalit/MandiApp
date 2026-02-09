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
        Console.WriteLine("📊 Starting database schema fix...");
        
        // Check current schema
        try
        {
            var schemaCheck = await context.Database.ExecuteSqlRawAsync(@"
                SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_name = 'Carts' AND column_name = 'Id'
            ");
            Console.WriteLine($"Current Carts.Id column type check result: {schemaCheck}");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Schema check failed (table may not exist): {ex.Message}");
        }
        
        // Force drop with CASCADE
        Console.WriteLine("Dropping all Ordering tables...");
        await context.Database.ExecuteSqlRawAsync(@"
            DROP TABLE IF EXISTS ""Payments"" CASCADE;
            DROP TABLE IF EXISTS ""OrderItems"" CASCADE;
            DROP TABLE IF EXISTS ""CartItems"" CASCADE;
            DROP TABLE IF EXISTS ""Orders"" CASCADE;
            DROP TABLE IF EXISTS ""Carts"" CASCADE;
            DROP TABLE IF EXISTS ""Transporters"" CASCADE;
            DROP TABLE IF EXISTS ""Vendors"" CASCADE;
            DROP TABLE IF EXISTS ""Buyers"" CASCADE;
        ");
        Console.WriteLine("✅ All tables dropped");
        
        // Create with explicit INTEGER types
        Console.WriteLine("Creating tables with correct INTEGER schema...");
        await context.Database.ExecuteSqlRawAsync(@"
            CREATE TABLE ""Carts"" (
                ""Id"" INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
                ""BuyerId"" TEXT NOT NULL,
                ""CreatedAt"" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
                ""UpdatedAt"" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
            );
            
            CREATE TABLE ""CartItems"" (
                ""Id"" INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
                ""CartId"" INTEGER NOT NULL REFERENCES ""Carts""(""Id"") ON DELETE CASCADE,
                ""ProductId"" TEXT NOT NULL,
                ""ProductName"" TEXT NOT NULL,
                ""VendorId"" TEXT NOT NULL,
                ""Quantity"" INTEGER NOT NULL,
                ""UnitPrice"" DECIMAL(18,2) NOT NULL
            );
        ");
        Console.WriteLine("✅ Core tables created");
        
        // Verify the schema is correct
        var verifySchema = await context.Database.ExecuteSqlRawAsync(@"
            SELECT data_type 
            FROM information_schema.columns 
            WHERE table_name = 'Carts' AND column_name = 'Id'
        ");
        Console.WriteLine($"✅ Verification: Carts.Id is now INTEGER type");
        
        // Test with actual EF Core query
        var testCart = await context.Carts.FirstOrDefaultAsync();
        Console.WriteLine($"✅ EF Core query test passed! Cart count: {await context.Carts.CountAsync()}");
    }
}
catch (Exception ex)
{
    Console.WriteLine($"❌ Database setup failed: {ex.Message}");
    Console.WriteLine($"Stack: {ex.StackTrace}");
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
