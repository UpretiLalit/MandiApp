-- B2B Mandi App - PostgreSQL Database Schema
-- Date: January 13, 2026

-- ============================================
-- IDENTITY DATABASE (Identity.API)
-- ============================================

-- AspNetUsers (managed by ASP.NET Core Identity)
-- Extended with custom fields in ApplicationUser class

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

CREATE INDEX "IX_OtpVerifications_PhoneNumber" ON "OtpVerifications" ("PhoneNumber");
CREATE INDEX "IX_OtpVerifications_ExpiresAt" ON "OtpVerifications" ("ExpiresAt");

-- ============================================
-- ORDERING DATABASE (Ordering.API)
-- ============================================

-- Buyers Table
CREATE TABLE IF NOT EXISTS "Buyers" (
    "Id" VARCHAR(450) PRIMARY KEY, -- User ID from Identity service
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

CREATE INDEX "IX_Buyers_PhoneNumber" ON "Buyers" ("PhoneNumber");
CREATE INDEX "IX_Buyers_IsVerified" ON "Buyers" ("IsVerified");

-- Vendors Table
CREATE TABLE IF NOT EXISTS "Vendors" (
    "Id" VARCHAR(450) PRIMARY KEY, -- User ID from Identity service
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
    "CommissionRate" DECIMAL(5,4) NOT NULL DEFAULT 0.0300, -- 3%
    "TotalEarnings" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "TotalOrders" INTEGER NOT NULL DEFAULT 0,
    "Rating" DECIMAL(3,2) NOT NULL DEFAULT 0,
    "RatingCount" INTEGER NOT NULL DEFAULT 0,
    "CreatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "LastActiveAt" TIMESTAMP NULL
);

CREATE INDEX "IX_Vendors_PhoneNumber" ON "Vendors" ("PhoneNumber");
CREATE INDEX "IX_Vendors_IsActive" ON "Vendors" ("IsActive");
CREATE INDEX "IX_Vendors_IsVerified" ON "Vendors" ("IsVerified");
CREATE INDEX "IX_Vendors_Rating" ON "Vendors" ("Rating");

-- Transporters Table
CREATE TABLE IF NOT EXISTS "Transporters" (
    "Id" VARCHAR(450) PRIMARY KEY, -- User ID from Identity service
    "FullName" VARCHAR(200) NOT NULL,
    "PhoneNumber" VARCHAR(15) NOT NULL,
    "Email" VARCHAR(255),
    "VehicleNumber" VARCHAR(50) NOT NULL,
    "VehicleType" INTEGER NOT NULL DEFAULT 0, -- 0=TwoWheeler, 1=ThreeWheeler, 2=FourWheeler, 3=Truck
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

CREATE INDEX "IX_Transporters_PhoneNumber" ON "Transporters" ("PhoneNumber");
CREATE INDEX "IX_Transporters_IsAvailable" ON "Transporters" ("IsAvailable");
CREATE INDEX "IX_Transporters_IsVerified" ON "Transporters" ("IsVerified");
CREATE INDEX "IX_Transporters_Rating" ON "Transporters" ("Rating");

-- Orders Table
CREATE TABLE IF NOT EXISTS "Orders" (
    "Id" SERIAL PRIMARY KEY,
    "OrderNumber" VARCHAR(50) NOT NULL UNIQUE,
    "BuyerId" VARCHAR(450) NOT NULL,
    "TransporterId" VARCHAR(450),
    "Status" INTEGER NOT NULL DEFAULT 0, -- 0=Pending, 1=VendorsNotified, 2=ReadyForDispatch, etc.
    "ProduceTotal" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "LogisticsFee" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "ServiceFee" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "TotalAmount" DECIMAL(18,2) NOT NULL,
    "DeliveryAddress" TEXT NOT NULL,
    "IsEscrow" BOOLEAN NOT NULL DEFAULT FALSE,
    "EscrowStatus" INTEGER NOT NULL DEFAULT 0, -- 0=Held, 1=Released, 2=Refunded
    "VendorsNotifiedAt" TIMESTAMP NULL,
    "DeliveryQRCode" VARCHAR(100),
    "DeliveryConfirmedAt" TIMESTAMP NULL,
    "DeliveryConfirmedBy" VARCHAR(450),
    "CreatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "CompletedAt" TIMESTAMP NULL,
    CONSTRAINT "FK_Orders_Buyers" FOREIGN KEY ("BuyerId") REFERENCES "Buyers" ("Id") ON DELETE CASCADE,
    CONSTRAINT "FK_Orders_Transporters" FOREIGN KEY ("TransporterId") REFERENCES "Transporters" ("Id") ON DELETE SET NULL
);

CREATE INDEX "IX_Orders_BuyerId" ON "Orders" ("BuyerId");
CREATE INDEX "IX_Orders_TransporterId" ON "Orders" ("TransporterId");
CREATE INDEX "IX_Orders_OrderNumber" ON "Orders" ("OrderNumber");
CREATE INDEX "IX_Orders_Status" ON "Orders" ("Status");
CREATE INDEX "IX_Orders_CreatedAt" ON "Orders" ("CreatedAt");

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

CREATE INDEX "IX_OrderItems_OrderId" ON "OrderItems" ("OrderId");
CREATE INDEX "IX_OrderItems_VendorId" ON "OrderItems" ("VendorId");
CREATE INDEX "IX_OrderItems_ProductId" ON "OrderItems" ("ProductId");

-- Payments Table
CREATE TABLE IF NOT EXISTS "Payments" (
    "Id" SERIAL PRIMARY KEY,
    "OrderId" INTEGER NOT NULL UNIQUE,
    "TransactionId" VARCHAR(100) NOT NULL UNIQUE,
    "Amount" DECIMAL(18,2) NOT NULL,
    "Status" INTEGER NOT NULL DEFAULT 0, -- 0=Pending, 1=Captured, 2=Failed, 3=Refunded, 4=EscrowReleased
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

CREATE INDEX "IX_Payments_OrderId" ON "Payments" ("OrderId");
CREATE INDEX "IX_Payments_TransactionId" ON "Payments" ("TransactionId");
CREATE INDEX "IX_Payments_Status" ON "Payments" ("Status");

-- Carts Table
CREATE TABLE IF NOT EXISTS "Carts" (
    "Id" SERIAL PRIMARY KEY,
    "BuyerId" VARCHAR(450) NOT NULL UNIQUE,
    "CreatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "UpdatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT "FK_Carts_Buyers" FOREIGN KEY ("BuyerId") REFERENCES "Buyers" ("Id") ON DELETE CASCADE
);

CREATE INDEX "IX_Carts_BuyerId" ON "Carts" ("BuyerId");

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

CREATE INDEX "IX_CartItems_CartId" ON "CartItems" ("CartId");
CREATE INDEX "IX_CartItems_ProductId" ON "CartItems" ("ProductId");
CREATE INDEX "IX_CartItems_VendorId" ON "CartItems" ("VendorId");

-- ============================================
-- MARKETPLACE DATABASE (Marketplace.API)
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

-- Products Table
CREATE TABLE IF NOT EXISTS "Products" (
    "Id" SERIAL PRIMARY KEY,
    "Name" VARCHAR(200) NOT NULL,
    "CategoryId" INTEGER NOT NULL,
    "Description" TEXT,
    "Unit" VARCHAR(20) NOT NULL, -- kg, litre, dozen, etc.
    "ImageUrl" VARCHAR(500),
    "IsActive" BOOLEAN NOT NULL DEFAULT TRUE,
    "CreatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT "FK_Products_Categories" FOREIGN KEY ("CategoryId") REFERENCES "Categories" ("Id") ON DELETE CASCADE
);

CREATE INDEX "IX_Products_CategoryId" ON "Products" ("CategoryId");
CREATE INDEX "IX_Products_IsActive" ON "Products" ("IsActive");

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

CREATE INDEX "IX_VendorInventory_VendorId" ON "VendorInventory" ("VendorId");
CREATE INDEX "IX_VendorInventory_ProductId" ON "VendorInventory" ("ProductId");
CREATE INDEX "IX_VendorInventory_IsAvailable" ON "VendorInventory" ("IsAvailable");
CREATE UNIQUE INDEX "IX_VendorInventory_Vendor_Product" ON "VendorInventory" ("VendorId", "ProductId");

-- ============================================
-- LOGISTICS DATABASE (Logistics.Hub)
-- ============================================

-- DeliveryTracking Table
CREATE TABLE IF NOT EXISTS "DeliveryTracking" (
    "Id" SERIAL PRIMARY KEY,
    "OrderId" INTEGER NOT NULL,
    "TransporterId" VARCHAR(450) NOT NULL,
    "Latitude" VARCHAR(50) NOT NULL,
    "Longitude" VARCHAR(50) NOT NULL,
    "Timestamp" TIMESTAMP NOT NULL DEFAULT NOW(),
    "Speed" DECIMAL(5,2), -- km/h
    "Heading" INTEGER -- 0-360 degrees
);

CREATE INDEX "IX_DeliveryTracking_OrderId" ON "DeliveryTracking" ("OrderId");
CREATE INDEX "IX_DeliveryTracking_TransporterId" ON "DeliveryTracking" ("TransporterId");
CREATE INDEX "IX_DeliveryTracking_Timestamp" ON "DeliveryTracking" ("Timestamp");

-- Routes Table
CREATE TABLE IF NOT EXISTS "Routes" (
    "Id" SERIAL PRIMARY KEY,
    "OrderId" INTEGER NOT NULL,
    "TransporterId" VARCHAR(450) NOT NULL,
    "VendorStops" JSONB NOT NULL, -- Array of vendor locations
    "BuyerLocation" JSONB NOT NULL,
    "OptimizedRoute" JSONB, -- Array of coordinates
    "EstimatedDistance" DECIMAL(10,2), -- km
    "EstimatedDuration" INTEGER, -- minutes
    "CreatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX "IX_Routes_OrderId" ON "Routes" ("OrderId");
CREATE INDEX "IX_Routes_TransporterId" ON "Routes" ("TransporterId");

-- ============================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================

-- Insert sample buyer
INSERT INTO "Buyers" ("Id", "FullName", "PhoneNumber", "Email", "CompanyName", "BusinessAddress", "DeliveryAddress", "IsVerified")
VALUES 
('buyer-001', 'Restaurant ABC', '+919876543210', 'restaurant@example.com', 'ABC Foods Pvt Ltd', 'S.G. Highway, Ahmedabad', 'S.G. Highway, Ahmedabad', TRUE);

-- Insert sample vendors
INSERT INTO "Vendors" ("Id", "FullName", "PhoneNumber", "BusinessName", "BusinessAddress", "Latitude", "Longitude", "IsVerified", "IsActive")
VALUES 
('vendor-001', 'Ramesh Kumar', '+919876543211', 'Fresh Farms Co.', 'APMC Market, Ahmedabad', '23.0225', '72.5714', TRUE, TRUE),
('vendor-002', 'Suresh Patel', '+919876543212', 'Green Valley Suppliers', 'Sardar Patel Market, Ahmedabad', '23.0330', '72.5850', TRUE, TRUE);

-- Insert sample transporter
INSERT INTO "Transporters" ("Id", "FullName", "PhoneNumber", "VehicleNumber", "VehicleType", "IsVerified", "IsAvailable")
VALUES 
('transporter-001', 'Vijay Singh', '+919876543213', 'GJ01AB1234', 2, TRUE, TRUE);

-- Insert sample categories
INSERT INTO "Categories" ("Name", "Description", "IsActive")
VALUES 
('Vegetables', 'Fresh vegetables', TRUE),
('Fruits', 'Fresh fruits', TRUE),
('Dairy', 'Milk and dairy products', TRUE);

-- Insert sample products
INSERT INTO "Products" ("Name", "CategoryId", "Unit", "IsActive")
VALUES 
('Tomato', 1, 'kg', TRUE),
('Onion', 1, 'kg', TRUE),
('Potato', 1, 'kg', TRUE),
('Apple', 2, 'kg', TRUE),
('Milk', 3, 'litre', TRUE);

-- Insert sample vendor inventory
INSERT INTO "VendorInventory" ("VendorId", "ProductId", "StockQuantity", "UnitPrice", "IsAvailable")
VALUES 
('vendor-001', 1, 500, 40.00, TRUE),
('vendor-001', 2, 300, 35.00, TRUE),
('vendor-002', 3, 600, 25.00, TRUE),
('vendor-002', 4, 200, 120.00, TRUE);
