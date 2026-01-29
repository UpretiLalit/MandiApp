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

// Configure Kestrel to use specific port
builder.WebHost.ConfigureKestrel(options =>
{
    options.ListenAnyIP(5002); // Ordering API port
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

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.WithOrigins("http://localhost:8100", "http://localhost:4200", "http://localhost:4201")
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});

var app = builder.Build();

// TODO: Database seeding temporarily disabled - tables need to be created first via migrations

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
