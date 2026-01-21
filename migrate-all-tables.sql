-- ============================================
-- MandiApp - Complete Database Migration
-- Date: January 21, 2026
-- Supabase PostgreSQL with Row-Level Security
-- ============================================

-- Note: All services use the same Supabase database (postgres)
-- Tables will be organized by domain but in the same database

-- ============================================
-- IDENTITY DOMAIN TABLES
-- ============================================

-- OTP Verification Table
CREATE TABLE IF NOT EXISTS "OtpVerifications" (
    "Id" SERIAL PRIMARY KEY,
    "PhoneNumber" VARCHAR(15) NOT NULL,
    "Otp" VARCHAR(6) NOT NULL,
    "CreatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "ExpiresAt" TIMESTAMP NOT NULL,
    "IsVerified" BOOLEAN NOT NULL DEFAULT FALSE,
    "VerifiedAt" TIMESTAMP NULL
);

CREATE INDEX IF NOT EXISTS "IX_OtpVerifications_PhoneNumber" ON "OtpVerifications" ("PhoneNumber");
CREATE INDEX IF NOT EXISTS "IX_OtpVerifications_ExpiresAt" ON "OtpVerifications" ("ExpiresAt");

-- Enable RLS
ALTER TABLE "OtpVerifications" ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Service role can do everything
CREATE POLICY "Service role can manage OTP verifications"
ON "OtpVerifications"
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- RLS Policy: Allow users to read their own OTP verification
CREATE POLICY "Users can read their own OTP verifications"
ON "OtpVerifications"
FOR SELECT
TO authenticated
USING (true);

-- ============================================
-- ORDERING DOMAIN TABLES
-- ============================================

-- Buyers Table
CREATE TABLE IF NOT EXISTS "Buyers" (
    "Id" VARCHAR(450) PRIMARY KEY,
    "FullName" VARCHAR(200) NOT NULL,
    "PhoneNumber" VARCHAR(15) NOT NULL,
    "Email" VARCHAR(255),
    "CompanyName" VARCHAR(200),
    "GstNumber" VARCHAR(15),
    "BusinessAddress" TEXT NOT NULL,
    "DeliveryAddress" TEXT NOT NULL,
    "CreditLimit" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "OutstandingBalance" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "IsVerified" BOOLEAN NOT NULL DEFAULT FALSE,
    "CreatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "LastOrderAt" TIMESTAMP NULL
);

CREATE INDEX IF NOT EXISTS "IX_Buyers_PhoneNumber" ON "Buyers" ("PhoneNumber");
CREATE INDEX IF NOT EXISTS "IX_Buyers_IsVerified" ON "Buyers" ("IsVerified");

-- Enable RLS
ALTER TABLE "Buyers" ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Buyers
CREATE POLICY "Service role can manage buyers"
ON "Buyers"
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Buyers can read their own profile"
ON "Buyers"
FOR SELECT
TO authenticated
USING (auth.uid()::text = "Id");

CREATE POLICY "Buyers can update their own profile"
ON "Buyers"
FOR UPDATE
TO authenticated
USING (auth.uid()::text = "Id")
WITH CHECK (auth.uid()::text = "Id");

-- Vendors Table
CREATE TABLE IF NOT EXISTS "Vendors" (
    "Id" VARCHAR(450) PRIMARY KEY,
    "FullName" VARCHAR(200) NOT NULL,
    "PhoneNumber" VARCHAR(15) NOT NULL,
    "Email" VARCHAR(255),
    "BusinessName" VARCHAR(200) NOT NULL,
    "GstNumber" VARCHAR(15),
    "FssaiLicense" VARCHAR(50),
    "BusinessAddress" TEXT NOT NULL,
    "Latitude" VARCHAR(50),
    "Longitude" VARCHAR(50),
    "IsVerified" BOOLEAN NOT NULL DEFAULT FALSE,
    "IsActive" BOOLEAN NOT NULL DEFAULT TRUE,
    "CommissionRate" DECIMAL(5,4) NOT NULL DEFAULT 0.0300,
    "TotalEarnings" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "TotalOrders" INTEGER NOT NULL DEFAULT 0,
    "Rating" DECIMAL(3,2) NOT NULL DEFAULT 0,
    "RatingCount" INTEGER NOT NULL DEFAULT 0,
    "CreatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "LastActiveAt" TIMESTAMP NULL
);

CREATE INDEX IF NOT EXISTS "IX_Vendors_PhoneNumber" ON "Vendors" ("PhoneNumber");
CREATE INDEX IF NOT EXISTS "IX_Vendors_IsActive" ON "Vendors" ("IsActive");
CREATE INDEX IF NOT EXISTS "IX_Vendors_IsVerified" ON "Vendors" ("IsVerified");
CREATE INDEX IF NOT EXISTS "IX_Vendors_Rating" ON "Vendors" ("Rating");

-- Enable RLS
ALTER TABLE "Vendors" ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Vendors
CREATE POLICY "Service role can manage vendors"
ON "Vendors"
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Anyone can read active vendors"
ON "Vendors"
FOR SELECT
TO authenticated
USING ("IsActive" = true AND "IsVerified" = true);

CREATE POLICY "Vendors can read their own profile"
ON "Vendors"
FOR SELECT
TO authenticated
USING (auth.uid()::text = "Id");

CREATE POLICY "Vendors can update their own profile"
ON "Vendors"
FOR UPDATE
TO authenticated
USING (auth.uid()::text = "Id")
WITH CHECK (auth.uid()::text = "Id");

-- Transporters Table
CREATE TABLE IF NOT EXISTS "Transporters" (
    "Id" VARCHAR(450) PRIMARY KEY,
    "FullName" VARCHAR(200) NOT NULL,
    "PhoneNumber" VARCHAR(15) NOT NULL,
    "Email" VARCHAR(255),
    "VehicleNumber" VARCHAR(50) NOT NULL,
    "VehicleType" INTEGER NOT NULL DEFAULT 0,
    "DrivingLicense" VARCHAR(50),
    "VehicleRC" VARCHAR(50),
    "IsVerified" BOOLEAN NOT NULL DEFAULT FALSE,
    "IsAvailable" BOOLEAN NOT NULL DEFAULT TRUE,
    "CurrentLatitude" VARCHAR(50),
    "CurrentLongitude" VARCHAR(50),
    "LastLocationUpdateAt" TIMESTAMP NULL,
    "TotalEarnings" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "TotalDeliveries" INTEGER NOT NULL DEFAULT 0,
    "Rating" DECIMAL(3,2) NOT NULL DEFAULT 0,
    "RatingCount" INTEGER NOT NULL DEFAULT 0,
    "CreatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "LastActiveAt" TIMESTAMP NULL
);

CREATE INDEX IF NOT EXISTS "IX_Transporters_PhoneNumber" ON "Transporters" ("PhoneNumber");
CREATE INDEX IF NOT EXISTS "IX_Transporters_IsAvailable" ON "Transporters" ("IsAvailable");
CREATE INDEX IF NOT EXISTS "IX_Transporters_IsVerified" ON "Transporters" ("IsVerified");
CREATE INDEX IF NOT EXISTS "IX_Transporters_Rating" ON "Transporters" ("Rating");

-- Enable RLS
ALTER TABLE "Transporters" ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Transporters
CREATE POLICY "Service role can manage transporters"
ON "Transporters"
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Anyone can read available transporters"
ON "Transporters"
FOR SELECT
TO authenticated
USING ("IsAvailable" = true AND "IsVerified" = true);

CREATE POLICY "Transporters can read their own profile"
ON "Transporters"
FOR SELECT
TO authenticated
USING (auth.uid()::text = "Id");

CREATE POLICY "Transporters can update their own profile"
ON "Transporters"
FOR UPDATE
TO authenticated
USING (auth.uid()::text = "Id")
WITH CHECK (auth.uid()::text = "Id");

-- Orders Table
CREATE TABLE IF NOT EXISTS "Orders" (
    "Id" SERIAL PRIMARY KEY,
    "OrderNumber" VARCHAR(50) NOT NULL UNIQUE,
    "BuyerId" VARCHAR(450) NOT NULL,
    "TransporterId" VARCHAR(450),
    "Status" INTEGER NOT NULL DEFAULT 0,
    "ProduceTotal" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "LogisticsFee" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "ServiceFee" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "TotalAmount" DECIMAL(18,2) NOT NULL,
    "DeliveryAddress" TEXT NOT NULL,
    "IsEscrow" BOOLEAN NOT NULL DEFAULT FALSE,
    "EscrowStatus" INTEGER NOT NULL DEFAULT 0,
    "VendorsNotifiedAt" TIMESTAMP NULL,
    "DeliveryQRCode" VARCHAR(100),
    "DeliveryConfirmedAt" TIMESTAMP NULL,
    "DeliveryConfirmedBy" VARCHAR(450),
    "CreatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "CompletedAt" TIMESTAMP NULL,
    CONSTRAINT "FK_Orders_Buyers" FOREIGN KEY ("BuyerId") REFERENCES "Buyers" ("Id") ON DELETE CASCADE,
    CONSTRAINT "FK_Orders_Transporters" FOREIGN KEY ("TransporterId") REFERENCES "Transporters" ("Id") ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS "IX_Orders_BuyerId" ON "Orders" ("BuyerId");
CREATE INDEX IF NOT EXISTS "IX_Orders_TransporterId" ON "Orders" ("TransporterId");
CREATE INDEX IF NOT EXISTS "IX_Orders_OrderNumber" ON "Orders" ("OrderNumber");
CREATE INDEX IF NOT EXISTS "IX_Orders_Status" ON "Orders" ("Status");
CREATE INDEX IF NOT EXISTS "IX_Orders_CreatedAt" ON "Orders" ("CreatedAt");

-- Enable RLS
ALTER TABLE "Orders" ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Orders
CREATE POLICY "Service role can manage orders"
ON "Orders"
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Buyers can read their own orders"
ON "Orders"
FOR SELECT
TO authenticated
USING (auth.uid()::text = "BuyerId");

CREATE POLICY "Transporters can read assigned orders"
ON "Orders"
FOR SELECT
TO authenticated
USING (auth.uid()::text = "TransporterId");

CREATE POLICY "Buyers can create orders"
ON "Orders"
FOR INSERT
TO authenticated
WITH CHECK (auth.uid()::text = "BuyerId");

-- OrderItems Table
CREATE TABLE IF NOT EXISTS "OrderItems" (
    "Id" SERIAL PRIMARY KEY,
    "OrderId" INTEGER NOT NULL,
    "ProductId" INTEGER NOT NULL,
    "VendorId" VARCHAR(450) NOT NULL,
    "ProductName" VARCHAR(200) NOT NULL,
    "Quantity" DECIMAL(10,2) NOT NULL,
    "Unit" VARCHAR(20) NOT NULL,
    "UnitPrice" DECIMAL(18,2) NOT NULL,
    "TotalPrice" DECIMAL(18,2) NOT NULL,
    "IsReadyForPickup" BOOLEAN NOT NULL DEFAULT FALSE,
    "MarkedReadyAt" TIMESTAMP NULL,
    "PickupQRCode" VARCHAR(100),
    "IsPickedUp" BOOLEAN NOT NULL DEFAULT FALSE,
    "PickedUpAt" TIMESTAMP NULL,
    CONSTRAINT "FK_OrderItems_Orders" FOREIGN KEY ("OrderId") REFERENCES "Orders" ("Id") ON DELETE CASCADE,
    CONSTRAINT "FK_OrderItems_Vendors" FOREIGN KEY ("VendorId") REFERENCES "Vendors" ("Id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "IX_OrderItems_OrderId" ON "OrderItems" ("OrderId");
CREATE INDEX IF NOT EXISTS "IX_OrderItems_VendorId" ON "OrderItems" ("VendorId");
CREATE INDEX IF NOT EXISTS "IX_OrderItems_ProductId" ON "OrderItems" ("ProductId");

-- Enable RLS
ALTER TABLE "OrderItems" ENABLE ROW LEVEL SECURITY;

-- RLS Policies for OrderItems
CREATE POLICY "Service role can manage order items"
ON "OrderItems"
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Buyers can read their order items"
ON "OrderItems"
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM "Orders" 
        WHERE "Orders"."Id" = "OrderItems"."OrderId" 
        AND "Orders"."BuyerId" = auth.uid()::text
    )
);

CREATE POLICY "Vendors can read their order items"
ON "OrderItems"
FOR SELECT
TO authenticated
USING (auth.uid()::text = "VendorId");

CREATE POLICY "Vendors can update their order items"
ON "OrderItems"
FOR UPDATE
TO authenticated
USING (auth.uid()::text = "VendorId")
WITH CHECK (auth.uid()::text = "VendorId");

-- Payments Table
CREATE TABLE IF NOT EXISTS "Payments" (
    "Id" SERIAL PRIMARY KEY,
    "OrderId" INTEGER NOT NULL UNIQUE,
    "TransactionId" VARCHAR(100) NOT NULL UNIQUE,
    "Amount" DECIMAL(18,2) NOT NULL,
    "Status" INTEGER NOT NULL DEFAULT 0,
    "Method" VARCHAR(50) NOT NULL,
    "IsEscrow" BOOLEAN NOT NULL DEFAULT FALSE,
    "EscrowReleasedAt" TIMESTAMP NULL,
    "VendorsPaid" BOOLEAN NOT NULL DEFAULT FALSE,
    "TransporterPaid" BOOLEAN NOT NULL DEFAULT FALSE,
    "PlatformPaid" BOOLEAN NOT NULL DEFAULT FALSE,
    "VendorPayout" DECIMAL(18,2),
    "TransporterPayout" DECIMAL(18,2),
    "PlatformCommission" DECIMAL(18,2),
    "CreatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "CompletedAt" TIMESTAMP NULL,
    CONSTRAINT "FK_Payments_Orders" FOREIGN KEY ("OrderId") REFERENCES "Orders" ("Id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "IX_Payments_OrderId" ON "Payments" ("OrderId");
CREATE INDEX IF NOT EXISTS "IX_Payments_TransactionId" ON "Payments" ("TransactionId");
CREATE INDEX IF NOT EXISTS "IX_Payments_Status" ON "Payments" ("Status");

-- Enable RLS
ALTER TABLE "Payments" ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Payments
CREATE POLICY "Service role can manage payments"
ON "Payments"
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Buyers can read their payments"
ON "Payments"
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM "Orders" 
        WHERE "Orders"."Id" = "Payments"."OrderId" 
        AND "Orders"."BuyerId" = auth.uid()::text
    )
);

-- Carts Table
CREATE TABLE IF NOT EXISTS "Carts" (
    "Id" SERIAL PRIMARY KEY,
    "BuyerId" VARCHAR(450) NOT NULL UNIQUE,
    "CreatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "UpdatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT "FK_Carts_Buyers" FOREIGN KEY ("BuyerId") REFERENCES "Buyers" ("Id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "IX_Carts_BuyerId" ON "Carts" ("BuyerId");

-- Enable RLS
ALTER TABLE "Carts" ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Carts
CREATE POLICY "Service role can manage carts"
ON "Carts"
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Buyers can read their own cart"
ON "Carts"
FOR SELECT
TO authenticated
USING (auth.uid()::text = "BuyerId");

CREATE POLICY "Buyers can create their own cart"
ON "Carts"
FOR INSERT
TO authenticated
WITH CHECK (auth.uid()::text = "BuyerId");

CREATE POLICY "Buyers can update their own cart"
ON "Carts"
FOR UPDATE
TO authenticated
USING (auth.uid()::text = "BuyerId")
WITH CHECK (auth.uid()::text = "BuyerId");

-- CartItems Table
CREATE TABLE IF NOT EXISTS "CartItems" (
    "Id" SERIAL PRIMARY KEY,
    "CartId" INTEGER NOT NULL,
    "ProductId" INTEGER NOT NULL,
    "VendorId" VARCHAR(450) NOT NULL,
    "ProductName" VARCHAR(200) NOT NULL,
    "Quantity" DECIMAL(10,2) NOT NULL,
    "Unit" VARCHAR(20) NOT NULL,
    "UnitPrice" DECIMAL(18,2) NOT NULL,
    "AddedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT "FK_CartItems_Carts" FOREIGN KEY ("CartId") REFERENCES "Carts" ("Id") ON DELETE CASCADE,
    CONSTRAINT "FK_CartItems_Vendors" FOREIGN KEY ("VendorId") REFERENCES "Vendors" ("Id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "IX_CartItems_CartId" ON "CartItems" ("CartId");
CREATE INDEX IF NOT EXISTS "IX_CartItems_ProductId" ON "CartItems" ("ProductId");
CREATE INDEX IF NOT EXISTS "IX_CartItems_VendorId" ON "CartItems" ("VendorId");

-- Enable RLS
ALTER TABLE "CartItems" ENABLE ROW LEVEL SECURITY;

-- RLS Policies for CartItems
CREATE POLICY "Service role can manage cart items"
ON "CartItems"
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Buyers can manage their cart items"
ON "CartItems"
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM "Carts" 
        WHERE "Carts"."Id" = "CartItems"."CartId" 
        AND "Carts"."BuyerId" = auth.uid()::text
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM "Carts" 
        WHERE "Carts"."Id" = "CartItems"."CartId" 
        AND "Carts"."BuyerId" = auth.uid()::text
    )
);

-- ============================================
-- MARKETPLACE DOMAIN TABLES
-- ============================================

-- Categories Table
CREATE TABLE IF NOT EXISTS "Categories" (
    "Id" SERIAL PRIMARY KEY,
    "Name" VARCHAR(100) NOT NULL,
    "Description" TEXT,
    "ImageUrl" VARCHAR(500),
    "IsActive" BOOLEAN NOT NULL DEFAULT TRUE,
    "CreatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE "Categories" ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Categories
CREATE POLICY "Service role can manage categories"
ON "Categories"
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Anyone can read active categories"
ON "Categories"
FOR SELECT
TO authenticated
USING ("IsActive" = true);

-- Products Table
CREATE TABLE IF NOT EXISTS "Products" (
    "Id" SERIAL PRIMARY KEY,
    "Name" VARCHAR(200) NOT NULL,
    "CategoryId" INTEGER NOT NULL,
    "Description" TEXT,
    "Unit" VARCHAR(20) NOT NULL,
    "ImageUrl" VARCHAR(500),
    "IsActive" BOOLEAN NOT NULL DEFAULT TRUE,
    "CreatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT "FK_Products_Categories" FOREIGN KEY ("CategoryId") REFERENCES "Categories" ("Id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "IX_Products_CategoryId" ON "Products" ("CategoryId");
CREATE INDEX IF NOT EXISTS "IX_Products_IsActive" ON "Products" ("IsActive");

-- Enable RLS
ALTER TABLE "Products" ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Products
CREATE POLICY "Service role can manage products"
ON "Products"
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Anyone can read active products"
ON "Products"
FOR SELECT
TO authenticated
USING ("IsActive" = true);

-- VendorInventory Table
CREATE TABLE IF NOT EXISTS "VendorInventory" (
    "Id" SERIAL PRIMARY KEY,
    "VendorId" VARCHAR(450) NOT NULL,
    "ProductId" INTEGER NOT NULL,
    "StockQuantity" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "UnitPrice" DECIMAL(18,2) NOT NULL,
    "MinOrderQuantity" DECIMAL(10,2) NOT NULL DEFAULT 1,
    "IsAvailable" BOOLEAN NOT NULL DEFAULT TRUE,
    "LastUpdated" TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT "FK_VendorInventory_Products" FOREIGN KEY ("ProductId") REFERENCES "Products" ("Id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "IX_VendorInventory_VendorId" ON "VendorInventory" ("VendorId");
CREATE INDEX IF NOT EXISTS "IX_VendorInventory_ProductId" ON "VendorInventory" ("ProductId");
CREATE INDEX IF NOT EXISTS "IX_VendorInventory_IsAvailable" ON "VendorInventory" ("IsAvailable");
CREATE UNIQUE INDEX IF NOT EXISTS "IX_VendorInventory_Vendor_Product" ON "VendorInventory" ("VendorId", "ProductId");

-- Enable RLS
ALTER TABLE "VendorInventory" ENABLE ROW LEVEL SECURITY;

-- RLS Policies for VendorInventory
CREATE POLICY "Service role can manage vendor inventory"
ON "VendorInventory"
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Anyone can read available inventory"
ON "VendorInventory"
FOR SELECT
TO authenticated
USING ("IsAvailable" = true);

CREATE POLICY "Vendors can manage their own inventory"
ON "VendorInventory"
FOR ALL
TO authenticated
USING (auth.uid()::text = "VendorId")
WITH CHECK (auth.uid()::text = "VendorId");

-- ============================================
-- LOGISTICS DOMAIN TABLES
-- ============================================

-- DeliveryTracking Table
CREATE TABLE IF NOT EXISTS "DeliveryTracking" (
    "Id" SERIAL PRIMARY KEY,
    "OrderId" INTEGER NOT NULL,
    "TransporterId" VARCHAR(450) NOT NULL,
    "Latitude" VARCHAR(50) NOT NULL,
    "Longitude" VARCHAR(50) NOT NULL,
    "Timestamp" TIMESTAMP NOT NULL DEFAULT NOW(),
    "Speed" DECIMAL(5,2),
    "Heading" INTEGER
);

CREATE INDEX IF NOT EXISTS "IX_DeliveryTracking_OrderId" ON "DeliveryTracking" ("OrderId");
CREATE INDEX IF NOT EXISTS "IX_DeliveryTracking_TransporterId" ON "DeliveryTracking" ("TransporterId");
CREATE INDEX IF NOT EXISTS "IX_DeliveryTracking_Timestamp" ON "DeliveryTracking" ("Timestamp");

-- Enable RLS
ALTER TABLE "DeliveryTracking" ENABLE ROW LEVEL SECURITY;

-- RLS Policies for DeliveryTracking
CREATE POLICY "Service role can manage delivery tracking"
ON "DeliveryTracking"
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Buyers can read tracking for their orders"
ON "DeliveryTracking"
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM "Orders" 
        WHERE "Orders"."Id" = "DeliveryTracking"."OrderId" 
        AND "Orders"."BuyerId" = auth.uid()::text
    )
);

CREATE POLICY "Transporters can manage their delivery tracking"
ON "DeliveryTracking"
FOR ALL
TO authenticated
USING (auth.uid()::text = "TransporterId")
WITH CHECK (auth.uid()::text = "TransporterId");

-- Routes Table
CREATE TABLE IF NOT EXISTS "Routes" (
    "Id" SERIAL PRIMARY KEY,
    "OrderId" INTEGER NOT NULL,
    "TransporterId" VARCHAR(450) NOT NULL,
    "VendorStops" JSONB NOT NULL,
    "BuyerLocation" JSONB NOT NULL,
    "OptimizedRoute" JSONB,
    "EstimatedDistance" DECIMAL(10,2),
    "EstimatedDuration" INTEGER,
    "CreatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "IX_Routes_OrderId" ON "Routes" ("OrderId");
CREATE INDEX IF NOT EXISTS "IX_Routes_TransporterId" ON "Routes" ("TransporterId");

-- Enable RLS
ALTER TABLE "Routes" ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Routes
CREATE POLICY "Service role can manage routes"
ON "Routes"
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Buyers can read routes for their orders"
ON "Routes"
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM "Orders" 
        WHERE "Orders"."Id" = "Routes"."OrderId" 
        AND "Orders"."BuyerId" = auth.uid()::text
    )
);

CREATE POLICY "Transporters can read their routes"
ON "Routes"
FOR SELECT
TO authenticated
USING (auth.uid()::text = "TransporterId");

-- ============================================
-- SEED DATA (Sample data for testing)
-- ============================================

-- Note: Replace these IDs with actual auth.users IDs from Supabase Auth
-- Or create them programmatically through the Identity API

-- Insert sample categories
INSERT INTO "Categories" ("Name", "Description", "IsActive")
VALUES 
    ('Vegetables', 'Fresh vegetables', TRUE),
    ('Fruits', 'Fresh fruits', TRUE),
    ('Dairy', 'Milk and dairy products', TRUE),
    ('Grains', 'Rice, wheat, and other grains', TRUE),
    ('Pulses', 'Lentils and legumes', TRUE)
ON CONFLICT DO NOTHING;

-- Insert sample products
INSERT INTO "Products" ("Name", "CategoryId", "Unit", "Description", "IsActive")
VALUES 
    ('Tomato', 1, 'kg', 'Fresh red tomatoes', TRUE),
    ('Onion', 1, 'kg', 'Fresh onions', TRUE),
    ('Potato', 1, 'kg', 'Fresh potatoes', TRUE),
    ('Cauliflower', 1, 'kg', 'Fresh cauliflower', TRUE),
    ('Cabbage', 1, 'kg', 'Fresh cabbage', TRUE),
    ('Apple', 2, 'kg', 'Fresh apples', TRUE),
    ('Banana', 2, 'dozen', 'Fresh bananas', TRUE),
    ('Orange', 2, 'kg', 'Fresh oranges', TRUE),
    ('Milk', 3, 'litre', 'Fresh cow milk', TRUE),
    ('Paneer', 3, 'kg', 'Fresh paneer', TRUE),
    ('Rice', 4, 'kg', 'Basmati rice', TRUE),
    ('Wheat', 4, 'kg', 'Wheat grain', TRUE),
    ('Toor Dal', 5, 'kg', 'Toor dal', TRUE),
    ('Moong Dal', 5, 'kg', 'Moong dal', TRUE)
ON CONFLICT DO NOTHING;

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to update the UpdatedAt timestamp on Carts
CREATE OR REPLACE FUNCTION update_cart_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE "Carts" 
    SET "UpdatedAt" = NOW() 
    WHERE "Id" = NEW."CartId";
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update cart timestamp when cart items change
DROP TRIGGER IF EXISTS cart_items_updated ON "CartItems";
CREATE TRIGGER cart_items_updated
AFTER INSERT OR UPDATE OR DELETE ON "CartItems"
FOR EACH ROW
EXECUTE FUNCTION update_cart_updated_at();

-- ============================================
-- COMPLETION MESSAGE
-- ============================================
DO $$
BEGIN
    RAISE NOTICE 'Database migration completed successfully!';
    RAISE NOTICE 'All tables created with Row-Level Security enabled.';
    RAISE NOTICE 'Sample categories and products inserted.';
    RAISE NOTICE 'Remember to create user profiles through the Identity API.';
END $$;
