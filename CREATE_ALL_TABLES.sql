-- ============================================
-- MandiApp - Complete Database Schema
-- PostgreSQL Migration Script
-- Run this directly on Supabase PostgreSQL server
-- Date: January 22, 2026
-- ============================================

-- ============================================
-- ASP.NET IDENTITY TABLES
-- (Used by Identity.API and Ordering.API)
-- ============================================

CREATE TABLE IF NOT EXISTS "AspNetRoles" (
    "Id" VARCHAR(450) PRIMARY KEY,
    "Name" VARCHAR(256),
    "NormalizedName" VARCHAR(256),
    "ConcurrencyStamp" TEXT
);

CREATE UNIQUE INDEX IF NOT EXISTS "RoleNameIndex" ON "AspNetRoles" ("NormalizedName");

CREATE TABLE IF NOT EXISTS "AspNetUsers" (
    "Id" VARCHAR(450) PRIMARY KEY,
    "UserName" VARCHAR(256),
    "NormalizedUserName" VARCHAR(256),
    "Email" VARCHAR(256),
    "NormalizedEmail" VARCHAR(256),
    "EmailConfirmed" BOOLEAN NOT NULL,
    "PasswordHash" TEXT,
    "SecurityStamp" TEXT,
    "ConcurrencyStamp" TEXT,
    "PhoneNumber" TEXT,
    "PhoneNumberConfirmed" BOOLEAN NOT NULL,
    "TwoFactorEnabled" BOOLEAN NOT NULL,
    "LockoutEnd" TIMESTAMPTZ,
    "LockoutEnabled" BOOLEAN NOT NULL,
    "AccessFailedCount" INTEGER NOT NULL,
    -- Custom fields
    "FullName" VARCHAR(200),
    "UserType" INTEGER NOT NULL DEFAULT 0,
    "IsVerified" BOOLEAN NOT NULL DEFAULT FALSE,
    "IsActive" BOOLEAN NOT NULL DEFAULT TRUE,
    "CreatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "EmailIndex" ON "AspNetUsers" ("NormalizedEmail");
CREATE UNIQUE INDEX IF NOT EXISTS "UserNameIndex" ON "AspNetUsers" ("NormalizedUserName");

CREATE TABLE IF NOT EXISTS "AspNetUserRoles" (
    "UserId" VARCHAR(450) NOT NULL,
    "RoleId" VARCHAR(450) NOT NULL,
    PRIMARY KEY ("UserId", "RoleId"),
    CONSTRAINT "FK_AspNetUserRoles_AspNetUsers" FOREIGN KEY ("UserId") REFERENCES "AspNetUsers" ("Id") ON DELETE CASCADE,
    CONSTRAINT "FK_AspNetUserRoles_AspNetRoles" FOREIGN KEY ("RoleId") REFERENCES "AspNetRoles" ("Id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "IX_AspNetUserRoles_RoleId" ON "AspNetUserRoles" ("RoleId");

CREATE TABLE IF NOT EXISTS "AspNetUserClaims" (
    "Id" SERIAL PRIMARY KEY,
    "UserId" VARCHAR(450) NOT NULL,
    "ClaimType" TEXT,
    "ClaimValue" TEXT,
    CONSTRAINT "FK_AspNetUserClaims_AspNetUsers" FOREIGN KEY ("UserId") REFERENCES "AspNetUsers" ("Id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "IX_AspNetUserClaims_UserId" ON "AspNetUserClaims" ("UserId");

CREATE TABLE IF NOT EXISTS "AspNetUserLogins" (
    "LoginProvider" VARCHAR(450) NOT NULL,
    "ProviderKey" VARCHAR(450) NOT NULL,
    "ProviderDisplayName" TEXT,
    "UserId" VARCHAR(450) NOT NULL,
    PRIMARY KEY ("LoginProvider", "ProviderKey"),
    CONSTRAINT "FK_AspNetUserLogins_AspNetUsers" FOREIGN KEY ("UserId") REFERENCES "AspNetUsers" ("Id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "IX_AspNetUserLogins_UserId" ON "AspNetUserLogins" ("UserId");

CREATE TABLE IF NOT EXISTS "AspNetUserTokens" (
    "UserId" VARCHAR(450) NOT NULL,
    "LoginProvider" VARCHAR(450) NOT NULL,
    "Name" VARCHAR(450) NOT NULL,
    "Value" TEXT,
    PRIMARY KEY ("UserId", "LoginProvider", "Name"),
    CONSTRAINT "FK_AspNetUserTokens_AspNetUsers" FOREIGN KEY ("UserId") REFERENCES "AspNetUsers" ("Id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "AspNetRoleClaims" (
    "Id" SERIAL PRIMARY KEY,
    "RoleId" VARCHAR(450) NOT NULL,
    "ClaimType" TEXT,
    "ClaimValue" TEXT,
    CONSTRAINT "FK_AspNetRoleClaims_AspNetRoles" FOREIGN KEY ("RoleId") REFERENCES "AspNetRoles" ("Id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "IX_AspNetRoleClaims_RoleId" ON "AspNetRoleClaims" ("RoleId");

-- ============================================
-- IDENTITY API TABLES
-- ============================================

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

-- ============================================
-- ORDERING API TABLES
-- ============================================

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

CREATE TABLE IF NOT EXISTS "Carts" (
    "Id" SERIAL PRIMARY KEY,
    "BuyerId" VARCHAR(450) NOT NULL UNIQUE,
    "CreatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "UpdatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT "FK_Carts_Buyers" FOREIGN KEY ("BuyerId") REFERENCES "Buyers" ("Id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "IX_Carts_BuyerId" ON "Carts" ("BuyerId");

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

-- ============================================
-- MARKETPLACE API TABLES
-- ============================================

-- Add missing columns to Products table if it already exists
DO $$
BEGIN
    -- Add IsAvailable column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'Products' AND column_name = 'IsAvailable') THEN
        ALTER TABLE "Products" ADD COLUMN "IsAvailable" BOOLEAN NOT NULL DEFAULT TRUE;
    END IF;
    
    -- Add Emoji column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'Products' AND column_name = 'Emoji') THEN
        ALTER TABLE "Products" ADD COLUMN "Emoji" VARCHAR(10);
    END IF;
    
    -- Add PriceTiersJson column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'Products' AND column_name = 'PriceTiersJson') THEN
        ALTER TABLE "Products" ADD COLUMN "PriceTiersJson" TEXT;
    END IF;
    
    -- Add MinOrderQty column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'Products' AND column_name = 'MinOrderQty') THEN
        ALTER TABLE "Products" ADD COLUMN "MinOrderQty" DECIMAL(10,2) NOT NULL DEFAULT 1;
    END IF;
    
    -- Add UpdatedAt column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'Products' AND column_name = 'UpdatedAt') THEN
        ALTER TABLE "Products" ADD COLUMN "UpdatedAt" TIMESTAMP NOT NULL DEFAULT NOW();
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS "Products" (
    "Id" SERIAL PRIMARY KEY,
    "Name" VARCHAR(200) NOT NULL,
    "Category" VARCHAR(100) NOT NULL,
    "Description" TEXT,
    "Grade" VARCHAR(10),
    "Unit" VARCHAR(20) NOT NULL,
    "ImageUrl" VARCHAR(500),
    "VendorId" VARCHAR(450) NOT NULL,
    "CurrentPrice" DECIMAL(18,2) NOT NULL,
    "StockQuantity" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "MinOrderQty" DECIMAL(10,2) NOT NULL DEFAULT 1,
    "IsAvailable" BOOLEAN NOT NULL DEFAULT TRUE,
    "Emoji" VARCHAR(10),
    "PriceTiersJson" TEXT,
    "CreatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "UpdatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "IX_Products_VendorId" ON "Products" ("VendorId");
CREATE INDEX IF NOT EXISTS "IX_Products_Category" ON "Products" ("Category");
CREATE INDEX IF NOT EXISTS "IX_Products_Grade" ON "Products" ("Grade");
CREATE INDEX IF NOT EXISTS "IX_Products_IsAvailable" ON "Products" ("IsAvailable");

-- Add missing columns to PriceHistories table if it already exists
DO $$
BEGIN
    -- Add Timestamp column if missing (might be named differently)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'PriceHistories' AND column_name = 'Timestamp') THEN
        -- Check if CreatedAt exists and rename it
        IF EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'PriceHistories' AND column_name = 'CreatedAt') THEN
            ALTER TABLE "PriceHistories" RENAME COLUMN "CreatedAt" TO "Timestamp";
        ELSE
            ALTER TABLE "PriceHistories" ADD COLUMN "Timestamp" TIMESTAMP NOT NULL DEFAULT NOW();
        END IF;
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS "PriceHistories" (
    "Id" SERIAL PRIMARY KEY,
    "ProductId" INTEGER NOT NULL,
    "Price" DECIMAL(18,2) NOT NULL,
    "Timestamp" TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT "FK_PriceHistories_Products" FOREIGN KEY ("ProductId") REFERENCES "Products" ("Id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "IX_PriceHistories_ProductId" ON "PriceHistories" ("ProductId");
CREATE INDEX IF NOT EXISTS "IX_PriceHistories_Timestamp" ON "PriceHistories" ("Timestamp");

CREATE TABLE IF NOT EXISTS "VendorInventories" (
    "Id" SERIAL PRIMARY KEY,
    "VendorId" VARCHAR(450) NOT NULL,
    "ProductId" INTEGER NOT NULL,
    "StockQuantity" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "UnitPrice" DECIMAL(18,2) NOT NULL,
    "MinOrderQuantity" DECIMAL(10,2) NOT NULL DEFAULT 1,
    "IsAvailable" BOOLEAN NOT NULL DEFAULT TRUE,
    "LastUpdated" TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT "FK_VendorInventories_Products" FOREIGN KEY ("ProductId") REFERENCES "Products" ("Id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "IX_VendorInventories_VendorId" ON "VendorInventories" ("VendorId");
CREATE INDEX IF NOT EXISTS "IX_VendorInventories_ProductId" ON "VendorInventories" ("ProductId");
CREATE INDEX IF NOT EXISTS "IX_VendorInventories_IsAvailable" ON "VendorInventories" ("IsAvailable");
CREATE UNIQUE INDEX IF NOT EXISTS "IX_VendorInventories_Vendor_Product" ON "VendorInventories" ("VendorId", "ProductId");

-- ============================================
-- LOGISTICS HUB TABLES
-- ============================================

CREATE TABLE IF NOT EXISTS "Deliveries" (
    "Id" SERIAL PRIMARY KEY,
    "OrderId" INTEGER NOT NULL UNIQUE,
    "TransporterId" VARCHAR(450) NOT NULL,
    "Status" INTEGER NOT NULL DEFAULT 0,
    "PickupLocation" TEXT NOT NULL,
    "DeliveryLocation" TEXT NOT NULL,
    "EstimatedDistance" DECIMAL(10,2),
    "EstimatedDuration" INTEGER,
    "ActualDistance" DECIMAL(10,2),
    "StartedAt" TIMESTAMP NULL,
    "CompletedAt" TIMESTAMP NULL,
    "CreatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "IX_Deliveries_OrderId" ON "Deliveries" ("OrderId");
CREATE INDEX IF NOT EXISTS "IX_Deliveries_TransporterId" ON "Deliveries" ("TransporterId");
CREATE INDEX IF NOT EXISTS "IX_Deliveries_Status" ON "Deliveries" ("Status");

CREATE TABLE IF NOT EXISTS "LocationTrackings" (
    "Id" SERIAL PRIMARY KEY,
    "DeliveryId" INTEGER NOT NULL,
    "Latitude" VARCHAR(50) NOT NULL,
    "Longitude" VARCHAR(50) NOT NULL,
    "Timestamp" TIMESTAMP NOT NULL DEFAULT NOW(),
    "Speed" DECIMAL(5,2),
    "Heading" INTEGER,
    CONSTRAINT "FK_LocationTrackings_Deliveries" FOREIGN KEY ("DeliveryId") REFERENCES "Deliveries" ("Id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "IX_LocationTrackings_DeliveryId" ON "LocationTrackings" ("DeliveryId");
CREATE INDEX IF NOT EXISTS "IX_LocationTrackings_Timestamp" ON "LocationTrackings" ("Timestamp");

-- ============================================
-- SEED DATA (Optional - for testing)
-- ============================================

-- Insert default roles
INSERT INTO "AspNetRoles" ("Id", "Name", "NormalizedName", "ConcurrencyStamp")
VALUES 
('role-buyer', 'Buyer', 'BUYER', gen_random_uuid()::text),
('role-vendor', 'Vendor', 'VENDOR', gen_random_uuid()::text),
('role-transporter', 'Transporter', 'TRANSPORTER', gen_random_uuid()::text),
('role-admin', 'Admin', 'ADMIN', gen_random_uuid()::text)
ON CONFLICT ("Id") DO NOTHING;

-- Insert sample buyer
INSERT INTO "Buyers" ("Id", "FullName", "PhoneNumber", "Email", "CompanyName", "BusinessAddress", "DeliveryAddress", "IsVerified")
VALUES 
('buyer-001', 'Restaurant ABC', '+919876543210', 'restaurant@example.com', 'ABC Foods Pvt Ltd', 'S.G. Highway, Ahmedabad', 'S.G. Highway, Ahmedabad', TRUE)
ON CONFLICT ("Id") DO NOTHING;

-- Insert sample vendors
INSERT INTO "Vendors" ("Id", "FullName", "PhoneNumber", "BusinessName", "BusinessAddress", "Latitude", "Longitude", "IsVerified", "IsActive")
VALUES 
('vendor-001', 'Ramesh Kumar', '+919876543211', 'Fresh Farms Co.', 'APMC Market, Ahmedabad', '23.0225', '72.5714', TRUE, TRUE),
('vendor-002', 'Suresh Patel', '+919876543212', 'Green Valley Suppliers', 'Sardar Patel Market, Ahmedabad', '23.0330', '72.5850', TRUE, TRUE)
ON CONFLICT ("Id") DO NOTHING;

-- Insert sample transporter
INSERT INTO "Transporters" ("Id", "FullName", "PhoneNumber", "VehicleNumber", "VehicleType", "IsVerified", "IsAvailable")
VALUES 
('transporter-001', 'Vijay Singh', '+919876543213', 'GJ01AB1234', 2, TRUE, TRUE)
ON CONFLICT ("Id") DO NOTHING;

-- Insert sample products (only core columns to handle existing tables)
INSERT INTO "Products" ("Name", "Category", "Unit", "VendorId", "CurrentPrice", "StockQuantity")
VALUES 
('Tomato', 'Vegetables', 'kg', 'vendor-001', 40.00, 500),
('Onion', 'Vegetables', 'kg', 'vendor-001', 35.00, 300),
('Potato', 'Vegetables', 'kg', 'vendor-002', 25.00, 600),
('Apple', 'Fruits', 'kg', 'vendor-002', 120.00, 200),
('Milk', 'Dairy', 'litre', 'vendor-001', 60.00, 100)
ON CONFLICT DO NOTHING;

-- Update existing products to add missing columns if needed
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'Products' AND column_name = 'IsAvailable') THEN
        UPDATE "Products" SET "IsAvailable" = TRUE WHERE "IsAvailable" IS NULL OR "IsAvailable" = FALSE;
    END IF;
END $$;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Run these to verify tables were created:
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;
-- SELECT COUNT(*) FROM "AspNetRoles";
-- SELECT COUNT(*) FROM "Buyers";
-- SELECT COUNT(*) FROM "Products";
