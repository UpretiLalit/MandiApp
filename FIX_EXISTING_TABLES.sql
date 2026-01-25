-- ============================================
-- Quick Fix for Existing Tables
-- Adds missing columns and creates missing tables only
-- Safe to run multiple times
-- ============================================

-- Fix all existing tables first
DO $$
BEGIN
    -- Products table fixes
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'Products') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Products' AND column_name = 'IsAvailable') THEN
            ALTER TABLE "Products" ADD COLUMN "IsAvailable" BOOLEAN NOT NULL DEFAULT TRUE;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Products' AND column_name = 'Emoji') THEN
            ALTER TABLE "Products" ADD COLUMN "Emoji" VARCHAR(10);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Products' AND column_name = 'PriceTiersJson') THEN
            ALTER TABLE "Products" ADD COLUMN "PriceTiersJson" TEXT;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Products' AND column_name = 'MinOrderQty') THEN
            ALTER TABLE "Products" ADD COLUMN "MinOrderQty" DECIMAL(10,2) NOT NULL DEFAULT 1;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Products' AND column_name = 'UpdatedAt') THEN
            ALTER TABLE "Products" ADD COLUMN "UpdatedAt" TIMESTAMP NOT NULL DEFAULT NOW();
        END IF;
    END IF;

    -- PriceHistories table fixes
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'PriceHistories') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'PriceHistories' AND column_name = 'Timestamp') THEN
            IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'PriceHistories' AND column_name = 'CreatedAt') THEN
                ALTER TABLE "PriceHistories" RENAME COLUMN "CreatedAt" TO "Timestamp";
            ELSE
                ALTER TABLE "PriceHistories" ADD COLUMN "Timestamp" TIMESTAMP NOT NULL DEFAULT NOW();
            END IF;
        END IF;
    END IF;
END $$;

-- Create ONLY the tables that don't exist
CREATE TABLE IF NOT EXISTS "AspNetRoles" (
    "Id" VARCHAR(450) PRIMARY KEY,
    "Name" VARCHAR(256),
    "NormalizedName" VARCHAR(256),
    "ConcurrencyStamp" TEXT
);

CREATE TABLE IF NOT EXISTS "AspNetUsers" (
    "Id" VARCHAR(450) PRIMARY KEY,
    "UserName" VARCHAR(256),
    "NormalizedUserName" VARCHAR(256),
    "Email" VARCHAR(256),
    "NormalizedEmail" VARCHAR(256),
    "EmailConfirmed" BOOLEAN NOT NULL DEFAULT FALSE,
    "PasswordHash" TEXT,
    "SecurityStamp" TEXT,
    "ConcurrencyStamp" TEXT,
    "PhoneNumber" TEXT,
    "PhoneNumberConfirmed" BOOLEAN NOT NULL DEFAULT FALSE,
    "TwoFactorEnabled" BOOLEAN NOT NULL DEFAULT FALSE,
    "LockoutEnd" TIMESTAMPTZ,
    "LockoutEnabled" BOOLEAN NOT NULL DEFAULT FALSE,
    "AccessFailedCount" INTEGER NOT NULL DEFAULT 0,
    "FullName" VARCHAR(200),
    "UserType" INTEGER NOT NULL DEFAULT 0,
    "IsVerified" BOOLEAN NOT NULL DEFAULT FALSE,
    "IsActive" BOOLEAN NOT NULL DEFAULT TRUE,
    "CreatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "AspNetUserRoles" (
    "UserId" VARCHAR(450) NOT NULL,
    "RoleId" VARCHAR(450) NOT NULL,
    PRIMARY KEY ("UserId", "RoleId")
);

CREATE TABLE IF NOT EXISTS "AspNetUserClaims" (
    "Id" SERIAL PRIMARY KEY,
    "UserId" VARCHAR(450) NOT NULL,
    "ClaimType" TEXT,
    "ClaimValue" TEXT
);

CREATE TABLE IF NOT EXISTS "AspNetUserLogins" (
    "LoginProvider" VARCHAR(450) NOT NULL,
    "ProviderKey" VARCHAR(450) NOT NULL,
    "ProviderDisplayName" TEXT,
    "UserId" VARCHAR(450) NOT NULL,
    PRIMARY KEY ("LoginProvider", "ProviderKey")
);

CREATE TABLE IF NOT EXISTS "AspNetUserTokens" (
    "UserId" VARCHAR(450) NOT NULL,
    "LoginProvider" VARCHAR(450) NOT NULL,
    "Name" VARCHAR(450) NOT NULL,
    "Value" TEXT,
    PRIMARY KEY ("UserId", "LoginProvider", "Name")
);

CREATE TABLE IF NOT EXISTS "AspNetRoleClaims" (
    "Id" SERIAL PRIMARY KEY,
    "RoleId" VARCHAR(450) NOT NULL,
    "ClaimType" TEXT,
    "ClaimValue" TEXT
);

CREATE TABLE IF NOT EXISTS "OtpVerifications" (
    "Id" SERIAL PRIMARY KEY,
    "PhoneNumber" VARCHAR(15) NOT NULL,
    "Otp" VARCHAR(6) NOT NULL,
    "CreatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "ExpiresAt" TIMESTAMP NOT NULL,
    "IsVerified" BOOLEAN NOT NULL DEFAULT FALSE,
    "VerifiedAt" TIMESTAMP NULL
);

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
    "CompletedAt" TIMESTAMP NULL
);

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
    "PickedUpAt" TIMESTAMP NULL
);

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
    "CompletedAt" TIMESTAMP NULL
);

CREATE TABLE IF NOT EXISTS "Carts" (
    "Id" SERIAL PRIMARY KEY,
    "BuyerId" VARCHAR(450) NOT NULL UNIQUE,
    "CreatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "UpdatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "CartItems" (
    "Id" SERIAL PRIMARY KEY,
    "CartId" INTEGER NOT NULL,
    "ProductId" INTEGER NOT NULL,
    "VendorId" VARCHAR(450) NOT NULL,
    "ProductName" VARCHAR(200) NOT NULL,
    "Quantity" DECIMAL(10,2) NOT NULL,
    "Unit" VARCHAR(20) NOT NULL,
    "UnitPrice" DECIMAL(18,2) NOT NULL,
    "AddedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "VendorInventories" (
    "Id" SERIAL PRIMARY KEY,
    "VendorId" VARCHAR(450) NOT NULL,
    "ProductId" INTEGER NOT NULL,
    "StockQuantity" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "UnitPrice" DECIMAL(18,2) NOT NULL,
    "MinOrderQuantity" DECIMAL(10,2) NOT NULL DEFAULT 1,
    "IsAvailable" BOOLEAN NOT NULL DEFAULT TRUE,
    "LastUpdated" TIMESTAMP NOT NULL DEFAULT NOW()
);

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

CREATE TABLE IF NOT EXISTS "LocationTrackings" (
    "Id" SERIAL PRIMARY KEY,
    "DeliveryId" INTEGER NOT NULL,
    "Latitude" VARCHAR(50) NOT NULL,
    "Longitude" VARCHAR(50) NOT NULL,
    "Timestamp" TIMESTAMP NOT NULL DEFAULT NOW(),
    "Speed" DECIMAL(5,2),
    "Heading" INTEGER
);

-- Insert sample data (safe - uses ON CONFLICT)
INSERT INTO "AspNetRoles" ("Id", "Name", "NormalizedName", "ConcurrencyStamp")
VALUES 
('role-buyer', 'Buyer', 'BUYER', gen_random_uuid()::text),
('role-vendor', 'Vendor', 'VENDOR', gen_random_uuid()::text),
('role-transporter', 'Transporter', 'TRANSPORTER', gen_random_uuid()::text),
('role-admin', 'Admin', 'ADMIN', gen_random_uuid()::text)
ON CONFLICT DO NOTHING;

INSERT INTO "Buyers" ("Id", "FullName", "PhoneNumber", "BusinessAddress", "DeliveryAddress", "IsVerified")
VALUES ('buyer-001', 'Restaurant ABC', '+919876543210', 'Ahmedabad', 'Ahmedabad', TRUE)
ON CONFLICT DO NOTHING;

INSERT INTO "Vendors" ("Id", "FullName", "PhoneNumber", "BusinessName", "BusinessAddress", "IsVerified", "IsActive")
VALUES 
('vendor-001', 'Ramesh Kumar', '+919876543211', 'Fresh Farms', 'Ahmedabad', TRUE, TRUE),
('vendor-002', 'Suresh Patel', '+919876543212', 'Green Valley', 'Ahmedabad', TRUE, TRUE)
ON CONFLICT DO NOTHING;

INSERT INTO "Transporters" ("Id", "FullName", "PhoneNumber", "VehicleNumber", "VehicleType", "IsVerified", "IsAvailable")
VALUES ('transporter-001', 'Vijay Singh', '+919876543213', 'GJ01AB1234', 2, TRUE, TRUE)
ON CONFLICT DO NOTHING;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Migration completed successfully!';
    RAISE NOTICE 'All tables created or updated.';
END $$;
