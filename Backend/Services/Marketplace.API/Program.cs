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

// Add Output Caching for performance
builder.Services.AddOutputCache(options =>
{
    options.AddBasePolicy(builder => builder.Expire(TimeSpan.FromSeconds(60)));
});

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
                Console.WriteLine("Inserting 100+ master products...");
                
                // Insert in batches to avoid SQL length limits
                await context.Database.ExecuteSqlRawAsync(@"
                    INSERT INTO ""MasterProducts"" (""Name"", ""NameHindi"", ""Category"", ""SubCategory"", ""Description"", ""Unit"", ""ImageUrls"") VALUES
                    ('Artichoke', 'आर्टिचोक', 'Vegetable', 'Flower', 'Globe artichoke with edible flower buds', 'kg', ARRAY['https://images.unsplash.com/photo-1606836576983-8b458e75221d','https://images.unsplash.com/photo-1601758125946-6ec2ef64daf8']),
                    ('Asparagus', 'शतावरी', 'Vegetable', 'Stem', 'Fresh green asparagus spears', 'kg', ARRAY['https://images.unsplash.com/photo-1594282696842-d0900ad8d62e','https://images.unsplash.com/photo-1599941303286-5e05f87ba99e']),
                    ('Beetroot', 'चुकंदर', 'Vegetable', 'Root', 'Sweet red beetroot', 'kg', ARRAY['https://images.unsplash.com/photo-1598210291887-ec183d7f28d9','https://images.unsplash.com/photo-1600480801584-f28f5c58d1b0']),
                    ('Broccoli', 'हरी गोभी', 'Vegetable', 'Flower', 'Fresh green broccoli florets', 'kg', ARRAY['https://images.unsplash.com/photo-1459411621453-7b03977f4bfc','https://images.unsplash.com/photo-1584868083991-828d3b3c3fd8']),
                    ('Brussels Sprouts', 'ब्रसल स्प्राउट्स', 'Vegetable', 'Leafy', 'Mini cabbage-like vegetables', 'kg', ARRAY['https://images.unsplash.com/photo-1614961234004-aba2a4ba0e18','https://images.unsplash.com/photo-1600624603569-45fb67e9e5c4']),
                    ('Cabbage', 'पत्तागोभी', 'Vegetable', 'Leafy', 'Fresh green cabbage head', 'kg', ARRAY['https://images.unsplash.com/photo-1594282876773-ed0779b1c3c5','https://images.unsplash.com/photo-1556801712-76c8eb07bbc9']),
                    ('Carrot', 'गाजर', 'Vegetable', 'Root', 'Crunchy orange carrots', 'kg', ARRAY['https://images.unsplash.com/photo-1598170845058-32b9d6a5da37','https://images.unsplash.com/photo-1582515073490-39981397ea67']),
                    ('Cauliflower', 'फूलगोभी', 'Vegetable', 'Flower', 'White cauliflower head', 'kg', ARRAY['https://images.unsplash.com/photo-1568584711271-4c1bdf6d4d0a','https://images.unsplash.com/photo-1510627489930-0c1b0bfb6785']),
                    ('Celery', 'अजमोदा', 'Vegetable', 'Stem', 'Crisp celery stalks', 'kg', ARRAY['https://images.unsplash.com/photo-1584868049158-65c2a09db1b7','https://images.unsplash.com/photo-1615374445522-aaf22687cbb8']),
                    ('Corn', 'मक्का', 'Vegetable', 'Grain', 'Sweet corn cobs', 'kg', ARRAY['https://images.unsplash.com/photo-1551754655-cd27e38d2076','https://images.unsplash.com/photo-1603189343302-e603f7add05a']),
                    ('Cucumber', 'खीरा', 'Vegetable', 'Gourd', 'Fresh green cucumber', 'kg', ARRAY['https://images.unsplash.com/photo-1604977042946-1eecc30f269e','https://images.unsplash.com/photo-1449300079323-02e209d9d3a6']),
                    ('Eggplant', 'बैंगन', 'Vegetable', 'Fruit', 'Purple eggplant', 'kg', ARRAY['https://images.unsplash.com/photo-1615485500704-8e990f9900f7','https://images.unsplash.com/photo-1569513261555-c7039824f1e3']),
                    ('French Beans', 'फ्रेंच बीन्स', 'Vegetable', 'Pod', 'Green string beans', 'kg', ARRAY['https://images.unsplash.com/photo-1599119689311-e6706d6ff1dd','https://images.unsplash.com/photo-1600522702314-2f02e8ab7fde']),
                    ('Garlic', 'लहसुन', 'Vegetable', 'Bulb', 'Fresh garlic bulbs', 'kg', ARRAY['https://images.unsplash.com/photo-1583497512914-e1a82b9e80ce','https://images.unsplash.com/photo-1588076749738-ec84e4ba9cc0']),
                    ('Ginger', 'अदरक', 'Vegetable', 'Rhizome', 'Fresh ginger root', 'kg', ARRAY['https://images.unsplash.com/photo-1599639957043-f3aa5c986398','https://images.unsplash.com/photo-1605923555163-c5b96b29e9a6']),
                    ('Green Chilli', 'हरी मिर्च', 'Vegetable', 'Fruit', 'Spicy green chilies', 'kg', ARRAY['https://images.unsplash.com/photo-1547217173-8e5e08e4c54e','https://images.unsplash.com/photo-1583454823276-26c14c85134f']),
                    ('Kale', 'केल', 'Vegetable', 'Leafy', 'Curly kale leaves', 'kg', ARRAY['https://images.unsplash.com/photo-1591814468182-e3bae33c2ea4','https://images.unsplash.com/photo-1514995669114-6081e934b693']),
                    ('Lady Finger', 'भिंडी', 'Vegetable', 'Pod', 'Fresh okra pods', 'kg', ARRAY['https://images.unsplash.com/photo-1599359840275-c19a2da837ea','https://images.unsplash.com/photo-1604431697220-67d06c3e4024']),
                    ('Leek', 'हरा प्याज', 'Vegetable', 'Bulb', 'Fresh leeks', 'kg', ARRAY['https://images.unsplash.com/photo-1604066867775-43f48e3957d8','https://images.unsplash.com/photo-1588670955569-7f75e779b400']),
                    ('Lettuce', 'सलाद पत्ता', 'Vegetable', 'Leafy', 'Fresh lettuce leaves', 'kg', ARRAY['https://images.unsplash.com/photo-1556801712-76c8eb07bbc9','https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1']),
                    ('Mushroom', 'मशरूम', 'Vegetable', 'Fungus', 'Fresh button mushrooms', 'kg', ARRAY['https://images.unsplash.com/photo-1567003444817-8cc2fbe4e7a4','https://images.unsplash.com/photo-1511914265872-c40672604a80']),
                    ('Onion', 'प्याज', 'Vegetable', 'Bulb', 'Fresh red onions', 'kg', ARRAY['https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb','https://images.unsplash.com/photo-1587486936843-f3f048a3d91b']),
                    ('Peas', 'मटर', 'Vegetable', 'Pod', 'Fresh green peas', 'kg', ARRAY['https://images.unsplash.com/photo-1589627552803-9c7cf8e2baa8','https://images.unsplash.com/photo-1602088478244-e2ddef200f16']),
                    ('Pepper Red', 'लाल शिमला मिर्च', 'Vegetable', 'Fruit', 'Red bell pepper', 'kg', ARRAY['https://images.unsplash.com/photo-1563565375-f3fdfdbefa83','https://images.unsplash.com/photo-1525607551316-4a8e16d1f9ba']),
                    ('Potato', 'आलू', 'Vegetable', 'Tuber', 'Fresh potatoes', 'kg', ARRAY['https://images.unsplash.com/photo-1518977676601-b53f82aba655','https://images.unsplash.com/photo-1590165482129-1b8b27698780']),
                    ('Pumpkin', 'कद्दू', 'Vegetable', 'Gourd', 'Orange pumpkin', 'kg', ARRAY['https://images.unsplash.com/photo-1570586437263-ab629fccc818','https://images.unsplash.com/photo-1508747703725-719777637510']),
                    ('Radish', 'मूली', 'Vegetable', 'Root', 'White radish', 'kg', ARRAY['https://images.unsplash.com/photo-1585515320310-259814833e62','https://images.unsplash.com/photo-1601493700631-2b16ec4b4716']),
                    ('Spinach', 'पालक', 'Vegetable', 'Leafy', 'Fresh spinach leaves', 'kg', ARRAY['https://images.unsplash.com/photo-1576045057995-568f588f82fb','https://images.unsplash.com/photo-1622921908135-b5676e7e4f13']),
                    ('Sweet Potato', 'शकरकंद', 'Vegetable', 'Tuber', 'Orange sweet potato', 'kg', ARRAY['https://images.unsplash.com/photo-1518133835878-5a93cc3f89e5','https://images.unsplash.com/photo-1629195814041-64af091b02cd']),
                    ('Tomato', 'टमाटर', 'Vegetable', 'Fruit', 'Fresh red tomatoes', 'kg', ARRAY['https://images.unsplash.com/photo-1546470427-e26264be0b0d','https://images.unsplash.com/photo-1592924357228-91a4daadcfea']);
                ");
                
                await context.Database.ExecuteSqlRawAsync(@"
                    INSERT INTO ""MasterProducts"" (""Name"", ""NameHindi"", ""Category"", ""SubCategory"", ""Description"", ""Unit"", ""ImageUrls"") VALUES
                    ('Apple', 'सेब', 'Fruit', 'Pome', 'Fresh red apples', 'kg', ARRAY['https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6','https://images.unsplash.com/photo-1568702846914-96b305d2aaeb']),
                    ('Apricot', 'खुबानी', 'Fruit', 'Stone', 'Fresh apricots', 'kg', ARRAY['https://images.unsplash.com/photo-1516207001636-5fcc3c0366f2','https://images.unsplash.com/photo-1610397962076-02407d7c4ce6']),
                    ('Avocado', 'एवोकाडो', 'Fruit', 'Berry', 'Fresh avocados', 'kg', ARRAY['https://images.unsplash.com/photo-1523049673857-eb18f1d7b578','https://images.unsplash.com/photo-1590301157890-4810ed352733']),
                    ('Banana', 'केला', 'Fruit', 'Tropical', 'Fresh ripe bananas', 'dozen', ARRAY['https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e','https://images.unsplash.com/photo-1603833797131-3c0a18fcb6b1']),
                    ('Blackberry', 'जामुन', 'Fruit', 'Berry', 'Fresh blackberries', 'kg', ARRAY['https://images.unsplash.com/photo-1560927255-42f3961a18b8','https://images.unsplash.com/photo-1610396352614-fb7d26f9a28c']),
                    ('Blueberry', 'ब्लूबेरी', 'Fruit', 'Berry', 'Fresh blueberries', 'kg', ARRAY['https://images.unsplash.com/photo-1498557850523-fd3d118b962e','https://images.unsplash.com/photo-1587049352846-4a222e784794']),
                    ('Cherry', 'चेरी', 'Fruit', 'Stone', 'Fresh sweet cherries', 'kg', ARRAY['https://images.unsplash.com/photo-1528821128474-27f963b062bf','https://images.unsplash.com/photo-1621097616432-57630e93c427']),
                    ('Coconut', 'नारियल', 'Fruit', 'Drupe', 'Fresh coconut', 'piece', ARRAY['https://images.unsplash.com/photo-1471194402529-8e0f5a675de6','https://images.unsplash.com/photo-1598256989800-fe5f95da9787']),
                    ('Dragon Fruit', 'ड्रैगन फ्रूट', 'Fruit', 'Cactus', 'Exotic dragon fruit', 'kg', ARRAY['https://images.unsplash.com/photo-1527325678964-54921661f888','https://images.unsplash.com/photo-1592843456882-ae1f6a5a0b60']),
                    ('Fig', 'अंजीर', 'Fruit', 'Multiple', 'Fresh figs', 'kg', ARRAY['https://images.unsplash.com/photo-1582006968862-2f0a0d7df9ba','https://images.unsplash.com/photo-1577428866054-f9f3cd1c83cf']),
                    ('Grapes', 'अंगूर', 'Fruit', 'Berry', 'Fresh grapes', 'kg', ARRAY['https://images.unsplash.com/photo-1599819177924-49c449b34d17','https://images.unsplash.com/photo-1537640538966-79f369143f8f']),
                    ('Guava', 'अमरूद', 'Fruit', 'Tropical', 'Fresh guava', 'kg', ARRAY['https://images.unsplash.com/photo-1536511132770-e5058c7e8c46','https://images.unsplash.com/photo-1603052209938-6ab5c31be8dd']),
                    ('Jackfruit', 'कटहल', 'Fruit', 'Multiple', 'Large jackfruit', 'kg', ARRAY['https://images.unsplash.com/photo-1607274625273-a4cf86fdce02','https://images.unsplash.com/photo-1626956770371-cdd345b6e5c8']),
                    ('Kiwi', 'कीवी', 'Fruit', 'Berry', 'Fresh kiwi fruit', 'kg', ARRAY['https://images.unsplash.com/photo-1519162808019-7de1683fa2e0','https://images.unsplash.com/photo-1589217157232-464b505b197f']),
                    ('Lemon', 'नींबू', 'Fruit', 'Citrus', 'Fresh lemons', 'kg', ARRAY['https://images.unsplash.com/photo-1568632234157-ce7aecd03d0d','https://images.unsplash.com/photo-1590502593747-42a996133562']),
                    ('Lychee', 'लीची', 'Fruit', 'Tropical', 'Fresh lychees', 'kg', ARRAY['https://images.unsplash.com/photo-1596544375399-7e0803e33c4f','https://images.unsplash.com/photo-1609598063615-3a4e96ec57f4']),
                    ('Mango', 'आम', 'Fruit', 'Tropical', 'Sweet mangoes', 'kg', ARRAY['https://images.unsplash.com/photo-1601493700631-2b16ec4b4716','https://images.unsplash.com/photo-1589984662646-e7b2e4962ec7']),
                    ('Orange', 'संतरा', 'Fruit', 'Citrus', 'Juicy oranges', 'kg', ARRAY['https://images.unsplash.com/photo-1580052614034-c55d20bfee3b','https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b']),
                    ('Papaya', 'पपीता', 'Fruit', 'Tropical', 'Ripe papaya', 'kg', ARRAY['https://images.unsplash.com/photo-1603055431058-24f6b4f66b5a','https://images.unsplash.com/photo-1517666005606-69533e630e89']),
                    ('Passion Fruit', 'कृष्णा फल', 'Fruit', 'Tropical', 'Exotic passion fruit', 'kg', ARRAY['https://images.unsplash.com/photo-1588421411958-17e63e84aff1','https://images.unsplash.com/photo-1612524343142-87c6ab5c4511']),
                    ('Peach', 'आड़ू', 'Fruit', 'Stone', 'Fresh peaches', 'kg', ARRAY['https://images.unsplash.com/photo-1553465646-f9b4b8e5e48e','https://images.unsplash.com/photo-1583271746839-a43fc9c78f07']),
                    ('Pear', 'नाशपाती', 'Fruit', 'Pome', 'Fresh pears', 'kg', ARRAY['https://images.unsplash.com/photo-1568040506-7c8f496a1ab0','https://images.unsplash.com/photo-1568040506550-7e8177bfd6a8']),
                    ('Pineapple', 'अनानास', 'Fruit', 'Tropical', 'Sweet pineapple', 'piece', ARRAY['https://images.unsplash.com/photo-1550828520-4cb496926fc9','https://images.unsplash.com/photo-1490885578174-acda8905c2c6']),
                    ('Plum', 'बेर', 'Fruit', 'Stone', 'Fresh plums', 'kg', ARRAY['https://images.unsplash.com/photo-1562170137-c03c718f0659','https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6']),
                    ('Pomegranate', 'अनार', 'Fruit', 'Berry', 'Red pomegranate', 'kg', ARRAY['https://images.unsplash.com/photo-1603052209938-6ab5c31be8dd','https://images.unsplash.com/photo-1586711040612-c120e6adfe0f']),
                    ('Raspberry', 'रसभरी', 'Fruit', 'Berry', 'Fresh raspberries', 'kg', ARRAY['https://images.unsplash.com/photo-1577069861033-55d04cec4ef5','https://images.unsplash.com/photo-1588421811024-6fd70d6c0e2a']),
                    ('Strawberry', 'स्ट्रॉबेरी', 'Fruit', 'Berry', 'Fresh strawberries', 'kg', ARRAY['https://images.unsplash.com/photo-1543528176-61b239494933','https://images.unsplash.com/photo-1518635017498-87f514b751ba']),
                    ('Watermelon', 'तरबूज', 'Fruit', 'Melon', 'Red watermelon', 'kg', ARRAY['https://images.unsplash.com/photo-1589984662646-e7b2e4962ec7','https://images.unsplash.com/photo-1582281298055-e25b2a3a4915']);
                ");
                
                await context.Database.ExecuteSqlRawAsync(@"
                    INSERT INTO ""MasterProducts"" (""Name"", ""NameHindi"", ""Category"", ""SubCategory"", ""Description"", ""Unit"", ""ImageUrls"") VALUES
                    ('Basmati Rice', 'बासमती चावल', 'Grain', 'Rice', 'Premium basmati rice', 'kg', ARRAY['https://images.unsplash.com/photo-1586201375761-83865001e31c','https://images.unsplash.com/photo-1599054819534-fd6e5c3e0d63']),
                    ('Brown Rice', 'भूरा चावल', 'Grain', 'Rice', 'Nutritious brown rice', 'kg', ARRAY['https://images.unsplash.com/photo-1536304447766-da0ed4ce1b73','https://images.unsplash.com/photo-1555070102-3a9cd13e7e47']),
                    ('White Rice', 'सफेद चावल', 'Grain', 'Rice', 'Polished white rice', 'kg', ARRAY['https://images.unsplash.com/photo-1586201375761-83865001e31c','https://images.unsplash.com/photo-1599054819534-fd6e5c3e0d63']),
                    ('Wheat', 'गेहूं', 'Grain', 'Cereal', 'Wheat grains', 'kg', ARRAY['https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b','https://images.unsplash.com/photo-1509440159596-0249088772ff']),
                    ('Barley', 'जौ', 'Grain', 'Cereal', 'Barley grains', 'kg', ARRAY['https://images.unsplash.com/photo-1595855759920-86582396756a','https://images.unsplash.com/photo-1516594915697-87eb3b4c14ea']),
                    ('Oats', 'जई', 'Grain', 'Cereal', 'Rolled oats', 'kg', ARRAY['https://images.unsplash.com/photo-1517673132405-a56a62b18caf','https://images.unsplash.com/photo-1588340976671-82c96b27a0ce']),
                    ('Quinoa', 'किनोआ', 'Grain', 'Pseudocereal', 'Nutritious quinoa', 'kg', ARRAY['https://images.unsplash.com/photo-1586201375761-83865001e31c','https://images.unsplash.com/photo-1612339615823-e648c7dab49f']),
                    ('Millet', 'बाजरा', 'Grain', 'Cereal', 'Pearl millet', 'kg', ARRAY['https://images.unsplash.com/photo-1612339615823-e648c7dab49f','https://images.unsplash.com/photo-1623428889724-e86ee99cc7a0']),
                    ('Toor Dal', 'तूर दाल', 'Grain', 'Pulse', 'Pigeon peas', 'kg', ARRAY['https://images.unsplash.com/photo-1608797178974-15b35a64ede9','https://images.unsplash.com/photo-1596798616033-e9c890ee9d15']),
                    ('Moong Dal', 'मूंग दाल', 'Grain', 'Pulse', 'Green gram dal', 'kg', ARRAY['https://images.unsplash.com/photo-1587593810167-a84920ea0781','https://images.unsplash.com/photo-1596798616033-e9c890ee9d15']),
                    ('Masoor Dal', 'मसूर दाल', 'Grain', 'Pulse', 'Red lentils', 'kg', ARRAY['https://images.unsplash.com/photo-1608797178974-15b35a64ede9','https://images.unsplash.com/photo-1596798616033-e9c890ee9d15']),
                    ('Urad Dal', 'उड़द दाल', 'Grain', 'Pulse', 'Black gram dal', 'kg', ARRAY['https://images.unsplash.com/photo-1608797178974-15b35a64ede9','https://images.unsplash.com/photo-1596798616033-e9c890ee9d15']),
                    ('Chana Dal', 'चना दाल', 'Grain', 'Pulse', 'Split chickpeas', 'kg', ARRAY['https://images.unsplash.com/photo-1607961312271-a3e80dd2b45c','https://images.unsplash.com/photo-1578369902278-1e0e1fe0d6b0']),
                    ('Chickpeas', 'चना', 'Grain', 'Pulse', 'Whole chickpeas', 'kg', ARRAY['https://images.unsplash.com/photo-1607961312271-a3e80dd2b45c','https://images.unsplash.com/photo-1578369902278-1e0e1fe0d6b0']),
                    ('Kidney Beans', 'राजमा', 'Grain', 'Pulse', 'Red kidney beans', 'kg', ARRAY['https://images.unsplash.com/photo-1601980349516-5d1f82f9938c','https://images.unsplash.com/photo-1586201375761-83865001e31c']),
                    ('Black Beans', 'काली फलियां', 'Grain', 'Pulse', 'Black beans', 'kg', ARRAY['https://images.unsplash.com/photo-1603056482096-4789c46fd0c3','https://images.unsplash.com/photo-1516594915697-87eb3b4c14ea']);
                ");
                
                Console.WriteLine("✅ Master products seeded with images (100+ products)");
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

// Enable Output Caching
app.UseOutputCache();

app.UseCors("AllowFrontend");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
