using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Ordering.API.Data;
using Ordering.API.Services;
using Ordering.API.Hubs;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
    });
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Database Configuration - In-Memory for testing
builder.Services.AddDbContext<OrderingDbContext>(options =>
    options.UseInMemoryDatabase("MandiOrderingDB"));

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

// SignalR for real-time updates
builder.Services.AddSignalR();

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.WithOrigins("http://localhost:8100", "http://localhost:4200")
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});

var app = builder.Build();

// Seed in-memory database with test data
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<OrderingDbContext>();
    
    // Add sample buyers
    context.Buyers.Add(new Ordering.API.Models.Buyer
    {
        Id = "buyer-001",
        FullName = "Restaurant ABC",
        PhoneNumber = "+919876543210",
        Email = "restaurant@example.com",
        CompanyName = "ABC Foods Pvt Ltd",
        BusinessAddress = "S.G. Highway, Ahmedabad",
        DeliveryAddress = "S.G. Highway, Ahmedabad",
        IsVerified = true
    });
    
    // Add sample vendors
    context.Vendors.Add(new Ordering.API.Models.Vendor
    {
        Id = "vendor-001",
        FullName = "Ramesh Kumar",
        PhoneNumber = "+919876543211",
        BusinessName = "Fresh Farms Co.",
        BusinessAddress = "APMC Market, Ahmedabad",
        Latitude = "23.0225",
        Longitude = "72.5714",
        IsVerified = true,
        IsActive = true
    });
    
    context.Vendors.Add(new Ordering.API.Models.Vendor
    {
        Id = "vendor-002",
        FullName = "Suresh Patel",
        PhoneNumber = "+919876543212",
        BusinessName = "Green Valley Suppliers",
        BusinessAddress = "Sardar Patel Market, Ahmedabad",
        Latitude = "23.0330",
        Longitude = "72.5850",
        IsVerified = true,
        IsActive = true
    });
    
    // Add sample transporter
    context.Transporters.Add(new Ordering.API.Models.Transporter
    {
        Id = "transporter-001",
        FullName = "Vijay Singh",
        PhoneNumber = "+919876543213",
        VehicleNumber = "GJ01AB1234",
        VehicleType = Ordering.API.Models.VehicleType.FourWheeler,
        IsVerified = true,
        IsAvailable = true
    });
    
    context.SaveChanges();
}

// Configure the HTTP request pipeline.
app.UseSwagger();
app.UseSwaggerUI();

app.UseHttpsRedirection();
app.UseCors("AllowAll");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// Map SignalR Hub
app.MapHub<PriceHub>("/hubs/price");

app.Run();
