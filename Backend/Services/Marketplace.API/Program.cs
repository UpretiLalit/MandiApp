using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Marketplace.API.Data;
using Marketplace.API.Services;

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

// Database Configuration - Use Supabase PostgreSQL
var connectionString = builder.Configuration.GetConnectionString("MarketplaceDb") ?? "Host=db.iytscokxxuxprrivmzvg.supabase.co;Port=5432;Database=postgres;User Id=postgres;Password=PYvWmYoMYiO3RiCJ;Ssl Mode=Require;Trust Server Certificate=true";
builder.Services.AddDbContext<MarketplaceDbContext>(options =>
    options.UseNpgsql(connectionString));

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
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey)),
        RoleClaimType = System.Security.Claims.ClaimTypes.Role
    };
    
    // Add detailed logging for authentication failures
    options.Events = new JwtBearerEvents
    {
        OnAuthenticationFailed = context =>
        {
            Console.WriteLine($"❌ JWT Authentication failed: {context.Exception.Message}");
            return Task.CompletedTask;
        },
        OnTokenValidated = context =>
        {
            var claims = context.Principal?.Claims.Select(c => $"{c.Type}: {c.Value}");
            Console.WriteLine($"✅ JWT Token validated. Claims: {string.Join(", ", claims ?? new[] { "none" })}");
            return Task.CompletedTask;
        },
        OnChallenge = context =>
        {
            Console.WriteLine($"⚠️ JWT Challenge: {context.Error}, {context.ErrorDescription}");
            return Task.CompletedTask;
        }
    };
});

// Custom Services
builder.Services.AddScoped<IProductService, ProductService>();
builder.Services.AddScoped<IPriceService, PriceService>();

// CORS - Allow frontend origins
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(
                "http://localhost:4200",
                "http://localhost:8100",
                "capacitor://localhost",
                "ionic://localhost",
                "http://localhost"
            )
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials();
    });
    
    // Fallback policy for development
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

// Apply migrations and seed data with error handling
Console.WriteLine("🚀 Starting database migration...");
try
{
    using (var scope = app.Services.CreateScope())
    {
        var context = scope.ServiceProvider.GetRequiredService<MarketplaceDbContext>();
        Console.WriteLine("📊 Ensuring Products table exists...");
        
        // First, add missing columns to existing table
        try
        {
            Console.WriteLine("🔧 Adding missing columns to Products table...");
            await context.Database.ExecuteSqlRawAsync(@"
                DO $$ 
                BEGIN
                    -- Add IsLive column
                    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Products' AND column_name = 'IsLive') THEN
                        ALTER TABLE ""Products"" ADD COLUMN ""IsLive"" BOOLEAN NOT NULL DEFAULT false;
                        RAISE NOTICE 'Added IsLive column';
                    ELSE
                        RAISE NOTICE 'IsLive column already exists';
                    END IF;
                    
                    -- Add MasterProductId column
                    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Products' AND column_name = 'MasterProductId') THEN
                        ALTER TABLE ""Products"" ADD COLUMN ""MasterProductId"" UUID;
                        RAISE NOTICE 'Added MasterProductId column';
                    ELSE
                        RAISE NOTICE 'MasterProductId column already exists';
                    END IF;
                END $$;
            ");
            Console.WriteLine("✅ Missing columns added successfully");
        }
        catch (Exception colEx)
        {
            Console.WriteLine($"⚠️ Column addition error: {colEx.Message}");
        }
        
        // Then create table if it doesn't exist (for new deployments)
        await context.Database.ExecuteSqlRawAsync(@"
            CREATE TABLE IF NOT EXISTS ""Products"" (
                ""Id"" INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
                ""VendorId"" TEXT NOT NULL,
                ""Name"" TEXT NOT NULL,
                ""Category"" TEXT NOT NULL,
                ""Description"" TEXT,
                ""Unit"" TEXT NOT NULL,
                ""CurrentPrice"" DECIMAL(18,2) NOT NULL,
                ""AvailableQuantity"" INTEGER NOT NULL,
                ""MinOrderQty"" INTEGER NOT NULL,
                ""ImageUrl"" TEXT,
                ""Grade"" TEXT,
                ""Emoji"" TEXT,
                ""IsActive"" BOOLEAN NOT NULL DEFAULT true,
                ""IsLive"" BOOLEAN NOT NULL DEFAULT false,
                ""MasterProductId"" UUID,
                ""PriceTiersJson"" TEXT,
                ""CreatedAt"" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
                ""UpdatedAt"" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
            );
            CREATE INDEX IF NOT EXISTS ""IX_Products_VendorId"" ON ""Products""(""VendorId"");
            CREATE INDEX IF NOT EXISTS ""IX_Products_Category"" ON ""Products""(""Category"");
            CREATE INDEX IF NOT EXISTS ""IX_Products_IsLive"" ON ""Products""(""IsLive"");
        ");
        Console.WriteLine("✅ Products table ready");
        
        // Seed Master Products with real images
        Console.WriteLine("🌱 Seeding master products with images...");
        try {
            await context.Database.ExecuteSqlRawAsync(@"
                -- Create MasterProducts table if not exists
                CREATE TABLE IF NOT EXISTS ""MasterProducts"" (
                    ""Id"" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    ""Name"" VARCHAR(200) NOT NULL,
                    ""NameHindi"" VARCHAR(200),
                    ""Category"" VARCHAR(100) NOT NULL,
                    ""SubCategory"" VARCHAR(100),
                    ""Description"" TEXT,
                    ""Unit"" VARCHAR(20) NOT NULL DEFAULT 'kg',
                    ""ImageUrls"" TEXT[],
                    ""CreatedAt"" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
                    ""UpdatedAt"" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
                );
                
                CREATE INDEX IF NOT EXISTS ""IX_MasterProducts_Category"" ON ""MasterProducts""(""Category"");
                CREATE INDEX IF NOT EXISTS ""IX_MasterProducts_Name"" ON ""MasterProducts""(""Name"");
                CREATE UNIQUE INDEX IF NOT EXISTS ""IX_MasterProducts_Name_Unique"" ON ""MasterProducts""(""Name"");
            ");
            
            // Check if table is empty
            var count = await context.Database.SqlQueryRaw<int>("SELECT COUNT(*) FROM \"MasterProducts\"").FirstOrDefaultAsync();
            Console.WriteLine($"Current master products count: {count}");
            
            if (count == 0) {
                Console.WriteLine("Inserting master products...");
                await context.Database.ExecuteSqlRawAsync(@"
                    INSERT INTO ""MasterProducts"" (""Name"", ""NameHindi"", ""Category"", ""SubCategory"", ""Description"", ""Unit"", ""ImageUrls"")
                    VALUES
                    ('Tomato', 'टमाटर', 'Vegetable', 'Fruit', 'Fresh red tomatoes', 'kg', ARRAY['https://images.unsplash.com/photo-1546470427-e26264be0b0d', 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea']),
                    ('Potato', 'आलू', 'Vegetable', 'Tuber', 'Fresh potatoes', 'kg', ARRAY['https://images.unsplash.com/photo-1518977676601-b53f82aba655', 'https://images.unsplash.com/photo-1590165482129-1b8b27698780']),
                    ('Onion', 'प्याज', 'Vegetable', 'Bulb', 'Fresh red onions', 'kg', ARRAY['https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb', 'https://images.unsplash.com/photo-1587486936843-f3f048a3d91b']),
                    ('Carrot', 'गाजर', 'Vegetable', 'Root', 'Fresh orange carrots', 'kg', ARRAY['https://images.unsplash.com/photo-1598170845058-32b9d6a5da37', 'https://images.unsplash.com/photo-1582515073490-39981397ea67']),
                    ('Cabbage', 'पत्तागोभी', 'Vegetable', 'Leafy', 'Fresh green cabbage', 'kg', ARRAY['https://images.unsplash.com/photo-1594282876773-ed0779b1c3c5', 'https://images.unsplash.com/photo-1556801712-76c8eb07bbc9']),
                    ('Cauliflower', 'फूलगोभी', 'Vegetable', 'Flower', 'Fresh cauliflower', 'kg', ARRAY['https://images.unsplash.com/photo-1568584711271-4c1bdf6d4d0a', 'https://images.unsplash.com/photo-1510627489930-0c1b0bfb6785']),
                    ('Broccoli', 'हरी गोभी', 'Vegetable', 'Flower', 'Fresh broccoli', 'kg', ARRAY['https://images.unsplash.com/photo-1459411621453-7b03977f4bfc', 'https://images.unsplash.com/photo-1584868083991-828d3b3c3fd8']),
                    ('Spinach', 'पालक', 'Vegetable', 'Leafy', 'Fresh green spinach', 'kg', ARRAY['https://images.unsplash.com/photo-1576045057995-568f588f82fb', 'https://images.unsplash.com/photo-1622921908135-b5676e7e4f13']),
                    ('Eggplant', 'बैंगन', 'Vegetable', 'Fruit', 'Fresh purple eggplant', 'kg', ARRAY['https://images.unsplash.com/photo-1615485500704-8e990f9900f7', 'https://images.unsplash.com/photo-1569513261555-c7039824f1e3']),
                    ('Lady Finger', 'भिंडी', 'Vegetable', 'Pod', 'Fresh okra', 'kg', ARRAY['https://images.unsplash.com/photo-1599359840275-c19a2da837ea', 'https://images.unsplash.com/photo-1604431697220-67d06c3e4024']),
                    ('Cucumber', 'खीरा', 'Vegetable', 'Gourd', 'Fresh green cucumber', 'kg', ARRAY['https://images.unsplash.com/photo-1604977042946-1eecc30f269e', 'https://images.unsplash.com/photo-1568584711271-4c1bdf6d4d0a']),
                    ('Pumpkin', 'कद्दू', 'Vegetable', 'Gourd', 'Fresh orange pumpkin', 'kg', ARRAY['https://images.unsplash.com/photo-1570586437263-ab629fccc818', 'https://images.unsplash.com/photo-1508747703725-719777637510']),
                    ('Beetroot', 'चुकंदर', 'Vegetable', 'Root', 'Fresh red beetroot', 'kg', ARRAY['https://images.unsplash.com/photo-1598210291887-ec183d7f28d9', 'https://images.unsplash.com/photo-1600480801584-f28f5c58d1b0']),
                    ('Ginger', 'अदरक', 'Vegetable', 'Rhizome', 'Fresh ginger root', 'kg', ARRAY['https://images.unsplash.com/photo-1599639957043-f3aa5c986398', 'https://images.unsplash.com/photo-1605923555163-c5b96b29e9a6']),
                    ('Garlic', 'लहसुन', 'Vegetable', 'Bulb', 'Fresh garlic bulbs', 'kg', ARRAY['https://images.unsplash.com/photo-1583497512914-e1a82b9e80ce', 'https://images.unsplash.com/photo-1588076749738-ec84e4ba9cc0']),
                    ('Apple', 'सेब', 'Fruit', 'Pome', 'Fresh red apples', 'kg', ARRAY['https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6', 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb']),
                    ('Banana', 'केला', 'Fruit', 'Tropical', 'Fresh ripe bananas', 'dozen', ARRAY['https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e', 'https://images.unsplash.com/photo-1603833797131-3c0a18fcb6b1']),
                    ('Mango', 'आम', 'Fruit', 'Tropical', 'Fresh sweet mangoes', 'kg', ARRAY['https://images.unsplash.com/photo-1601493700631-2b16ec4b4716', 'https://images.unsplash.com/photo-1589984662646-e7b2e4962ec7']),
                    ('Orange', 'संतरा', 'Fruit', 'Citrus', 'Fresh juicy oranges', 'kg', ARRAY['https://images.unsplash.com/photo-1580052614034-c55d20bfee3b', 'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b']),
                    ('Grapes', 'अंगूर', 'Fruit', 'Berry', 'Fresh green/red grapes', 'kg', ARRAY['https://images.unsplash.com/photo-1599819177924-49c449b34d17', 'https://images.unsplash.com/photo-1537640538966-79f369143f8f']),
                    ('Watermelon', 'तरबूज', 'Fruit', 'Melon', 'Fresh red watermelon', 'kg', ARRAY['https://images.unsplash.com/photo-1589984662646-e7b2e4962ec7', 'https://images.unsplash.com/photo-1582281298055-e25b2a3a4915']),
                    ('Papaya', 'पपीता', 'Fruit', 'Tropical', 'Fresh ripe papaya', 'kg', ARRAY['https://images.unsplash.com/photo-1603055431058-24f6b4f66b5a', 'https://images.unsplash.com/photo-1517666005606-69533e630e89']),
                    ('Pomegranate', 'अनार', 'Fruit', 'Berry', 'Fresh red pomegranate', 'kg', ARRAY['https://images.unsplash.com/photo-1603052209938-6ab5c31be8dd', 'https://images.unsplash.com/photo-1586711040612-c120e6adfe0f']),
                    ('Guava', 'अमरूद', 'Fruit', 'Tropical', 'Fresh guava', 'kg', ARRAY['https://images.unsplash.com/photo-1536511132770-e5058c7e8c46', 'https://images.unsplash.com/photo-1603052209938-6ab5c31be8dd']),
                    ('Pineapple', 'अनानास', 'Fruit', 'Tropical', 'Fresh sweet pineapple', 'piece', ARRAY['https://images.unsplash.com/photo-1550828520-4cb496926fc9', 'https://images.unsplash.com/photo-1490885578174-acda8905c2c6']),
                    ('Basmati Rice', 'बासमती चावल', 'Grain', 'Rice', 'Premium basmati rice', 'kg', ARRAY['https://images.unsplash.com/photo-1586201375761-83865001e31c', 'https://images.unsplash.com/photo-1599054819534-fd6e5c3e0d63']),
                    ('Wheat', 'गेहूं', 'Grain', 'Cereal', 'Fresh wheat grains', 'kg', ARRAY['https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b', 'https://images.unsplash.com/photo-1509440159596-0249088772ff']),
                    ('Toor Dal', 'तूर दाल', 'Grain', 'Pulse', 'Yellow pigeon peas', 'kg', ARRAY['https://images.unsplash.com/photo-1608797178974-15b35a64ede9', 'https://images.unsplash.com/photo-1596798616033-e9c890ee9d15']),
                    ('Moong Dal', 'मूंग दाल', 'Grain', 'Pulse', 'Green gram dal', 'kg', ARRAY['https://images.unsplash.com/photo-1587593810167-a84920ea0781', 'https://images.unsplash.com/photo-1596798616033-e9c890ee9d15']),
                    ('Chickpeas', 'चना', 'Grain', 'Pulse', 'Fresh chickpeas', 'kg', ARRAY['https://images.unsplash.com/photo-1607961312271-a3e80dd2b45c', 'https://images.unsplash.com/photo-1578369902278-1e0e1fe0d6b0']);
                ");
                Console.WriteLine("✅ Master products seeded with images (30 products)");
            } else {
                Console.WriteLine($"✅ Master products already exist ({count} products)");
            }
        } catch (Exception ex) {
            Console.WriteLine($"⚠️ Failed to seed master products: {ex.Message}");
            Console.WriteLine($"Stack trace: {ex.StackTrace}");
        }
        
        Console.WriteLine("🌱 Seeding mock data...");
        await DataSeeder.SeedMockDataAsync(context);
        Console.WriteLine("✅ Data seeded successfully");
    }
}
catch (Exception ex)
{
    Console.WriteLine($"⚠️ Database initialization failed: {ex.Message}");
    Console.WriteLine($"Stack trace: {ex.StackTrace}");
    Console.WriteLine("⚠️ Service will continue without seeded data");
}

// Configure the HTTP request pipeline.
// Enable Swagger in all environments
app.UseSwagger();
app.UseSwaggerUI();

// Disable HTTPS redirection when using Cloudflare Tunnel
// app.UseHttpsRedirection();
app.UseCors("AllowFrontend");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
