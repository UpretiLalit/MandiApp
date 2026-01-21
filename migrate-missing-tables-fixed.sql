-- ============================================
-- MandiApp - Missing Tables Migration (Fixed)
-- Date: January 21, 2026
-- Adds missing tables to existing Supabase database
-- ============================================

-- Helper function to drop policy if exists
CREATE OR REPLACE FUNCTION drop_policy_if_exists(tbl_name text, policy_name text)
RETURNS void AS $$
BEGIN
    -- Check if table exists first
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND information_schema.tables.table_name = tbl_name) THEN
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', policy_name, tbl_name);
    END IF;
EXCEPTION WHEN undefined_object THEN
    NULL;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- ORDERING DOMAIN TABLES
-- ============================================

-- Buyers Table
CREATE TABLE IF NOT EXISTS Buyers (
    Id VARCHAR(450) PRIMARY KEY,
    FullName VARCHAR(200) NOT NULL,
    PhoneNumber VARCHAR(15) NOT NULL,
    Email VARCHAR(255),
    CompanyName VARCHAR(200),
    GstNumber VARCHAR(15),
    BusinessAddress TEXT NOT NULL,
    DeliveryAddress TEXT NOT NULL,
    CreditLimit DECIMAL(18,2) NOT NULL DEFAULT 0,
    OutstandingBalance DECIMAL(18,2) NOT NULL DEFAULT 0,
    IsVerified BOOLEAN NOT NULL DEFAULT FALSE,
    CreatedAt TIMESTAMP NOT NULL DEFAULT NOW(),
    LastOrderAt TIMESTAMP NULL
);

CREATE INDEX IF NOT EXISTS IX_Buyers_PhoneNumber ON Buyers (PhoneNumber);
CREATE INDEX IF NOT EXISTS IX_Buyers_IsVerified ON Buyers (IsVerified);

ALTER TABLE Buyers ENABLE ROW LEVEL SECURITY;

SELECT drop_policy_if_exists('Buyers', 'Service role can manage buyers');
CREATE POLICY "Service role can manage buyers"
ON Buyers FOR ALL TO service_role
USING (true) WITH CHECK (true);

SELECT drop_policy_if_exists('Buyers', 'Buyers can read their own profile');
CREATE POLICY "Buyers can read their own profile"
ON Buyers FOR SELECT TO authenticated
USING (auth.uid()::text = Id);

-- Vendors Table
CREATE TABLE IF NOT EXISTS Vendors (
    Id VARCHAR(450) PRIMARY KEY,
    FullName VARCHAR(200) NOT NULL,
    PhoneNumber VARCHAR(15) NOT NULL,
    Email VARCHAR(255),
    BusinessName VARCHAR(200) NOT NULL,
    GstNumber VARCHAR(15),
    FssaiLicense VARCHAR(50),
    BusinessAddress TEXT NOT NULL,
    Latitude VARCHAR(50),
    Longitude VARCHAR(50),
    IsVerified BOOLEAN NOT NULL DEFAULT FALSE,
    IsActive BOOLEAN NOT NULL DEFAULT TRUE,
    CommissionRate DECIMAL(5,4) NOT NULL DEFAULT 0.0300,
    TotalEarnings DECIMAL(18,2) NOT NULL DEFAULT 0,
    TotalOrders INTEGER NOT NULL DEFAULT 0,
    Rating DECIMAL(3,2) NOT NULL DEFAULT 0,
    RatingCount INTEGER NOT NULL DEFAULT 0,
    CreatedAt TIMESTAMP NOT NULL DEFAULT NOW(),
    LastActiveAt TIMESTAMP NULL
);

CREATE INDEX IF NOT EXISTS IX_Vendors_PhoneNumber ON Vendors (PhoneNumber);
CREATE INDEX IF NOT EXISTS IX_Vendors_IsActive ON Vendors (IsActive);
CREATE INDEX IF NOT EXISTS IX_Vendors_IsVerified ON Vendors (IsVerified);
CREATE INDEX IF NOT EXISTS IX_Vendors_Rating ON Vendors (Rating);

ALTER TABLE Vendors ENABLE ROW LEVEL SECURITY;

SELECT drop_policy_if_exists('Vendors', 'Service role can manage vendors');
CREATE POLICY "Service role can manage vendors"
ON Vendors FOR ALL TO service_role
USING (true) WITH CHECK (true);

SELECT drop_policy_if_exists('Vendors', 'Anyone can read active vendors');
CREATE POLICY "Anyone can read active vendors"
ON Vendors FOR SELECT TO authenticated
USING (IsActive = true AND IsVerified = true);

SELECT drop_policy_if_exists('Vendors', 'Vendors can read their own profile');
CREATE POLICY "Vendors can read their own profile"
ON Vendors FOR SELECT TO authenticated
USING (auth.uid()::text = Id);

-- Transporters Table
CREATE TABLE IF NOT EXISTS Transporters (
    Id VARCHAR(450) PRIMARY KEY,
    FullName VARCHAR(200) NOT NULL,
    PhoneNumber VARCHAR(15) NOT NULL,
    Email VARCHAR(255),
    VehicleNumber VARCHAR(50) NOT NULL,
    VehicleType INTEGER NOT NULL DEFAULT 0,
    DrivingLicense VARCHAR(50),
    VehicleRC VARCHAR(50),
    IsVerified BOOLEAN NOT NULL DEFAULT FALSE,
    IsAvailable BOOLEAN NOT NULL DEFAULT TRUE,
    CurrentLatitude VARCHAR(50),
    CurrentLongitude VARCHAR(50),
    LastLocationUpdateAt TIMESTAMP NULL,
    TotalEarnings DECIMAL(18,2) NOT NULL DEFAULT 0,
    TotalDeliveries INTEGER NOT NULL DEFAULT 0,
    Rating DECIMAL(3,2) NOT NULL DEFAULT 0,
    RatingCount INTEGER NOT NULL DEFAULT 0,
    CreatedAt TIMESTAMP NOT NULL DEFAULT NOW(),
    LastActiveAt TIMESTAMP NULL
);

CREATE INDEX IF NOT EXISTS IX_Transporters_PhoneNumber ON Transporters (PhoneNumber);
CREATE INDEX IF NOT EXISTS IX_Transporters_IsAvailable ON Transporters (IsAvailable);
CREATE INDEX IF NOT EXISTS IX_Transporters_IsVerified ON Transporters (IsVerified);
CREATE INDEX IF NOT EXISTS IX_Transporters_Rating ON Transporters (Rating);

ALTER TABLE Transporters ENABLE ROW LEVEL SECURITY;

SELECT drop_policy_if_exists('Transporters', 'Service role can manage transporters');
CREATE POLICY "Service role can manage transporters"
ON Transporters FOR ALL TO service_role
USING (true) WITH CHECK (true);

SELECT drop_policy_if_exists('Transporters', 'Anyone can read available transporters');
CREATE POLICY "Anyone can read available transporters"
ON Transporters FOR SELECT TO authenticated
USING (IsAvailable = true AND IsVerified = true);

-- Orders Table
CREATE TABLE IF NOT EXISTS Orders (
    Id SERIAL PRIMARY KEY,
    OrderNumber VARCHAR(50) NOT NULL UNIQUE,
    BuyerId VARCHAR(450) NOT NULL,
    TransporterId VARCHAR(450),
    Status INTEGER NOT NULL DEFAULT 0,
    ProduceTotal DECIMAL(18,2) NOT NULL DEFAULT 0,
    LogisticsFee DECIMAL(18,2) NOT NULL DEFAULT 0,
    ServiceFee DECIMAL(18,2) NOT NULL DEFAULT 0,
    TotalAmount DECIMAL(18,2) NOT NULL,
    DeliveryAddress TEXT NOT NULL,
    IsEscrow BOOLEAN NOT NULL DEFAULT FALSE,
    EscrowStatus INTEGER NOT NULL DEFAULT 0,
    VendorsNotifiedAt TIMESTAMP NULL,
    DeliveryQRCode VARCHAR(100),
    DeliveryConfirmedAt TIMESTAMP NULL,
    DeliveryConfirmedBy VARCHAR(450),
    CreatedAt TIMESTAMP NOT NULL DEFAULT NOW(),
    CompletedAt TIMESTAMP NULL,
    CONSTRAINT FK_Orders_Buyers FOREIGN KEY (BuyerId) REFERENCES Buyers (Id) ON DELETE CASCADE,
    CONSTRAINT FK_Orders_Transporters FOREIGN KEY (TransporterId) REFERENCES Transporters (Id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS IX_Orders_BuyerId ON Orders (BuyerId);
CREATE INDEX IF NOT EXISTS IX_Orders_TransporterId ON Orders (TransporterId);
CREATE INDEX IF NOT EXISTS IX_Orders_OrderNumber ON Orders (OrderNumber);
CREATE INDEX IF NOT EXISTS IX_Orders_Status ON Orders (Status);
CREATE INDEX IF NOT EXISTS IX_Orders_CreatedAt ON Orders (CreatedAt);

ALTER TABLE Orders ENABLE ROW LEVEL SECURITY;

SELECT drop_policy_if_exists('Orders', 'Service role can manage orders');
CREATE POLICY "Service role can manage orders"
ON Orders FOR ALL TO service_role
USING (true) WITH CHECK (true);

SELECT drop_policy_if_exists('Orders', 'Buyers can read their own orders');
CREATE POLICY "Buyers can read their own orders"
ON Orders FOR SELECT TO authenticated
USING (auth.uid()::text = BuyerId);

SELECT drop_policy_if_exists('Orders', 'Buyers can create orders');
CREATE POLICY "Buyers can create orders"
ON Orders FOR INSERT TO authenticated
WITH CHECK (auth.uid()::text = BuyerId);

-- OrderItems Table
CREATE TABLE IF NOT EXISTS OrderItems (
    Id SERIAL PRIMARY KEY,
    OrderId INTEGER NOT NULL,
    ProductId INTEGER NOT NULL,
    VendorId VARCHAR(450) NOT NULL,
    ProductName VARCHAR(200) NOT NULL,
    Quantity DECIMAL(10,2) NOT NULL,
    Unit VARCHAR(20) NOT NULL,
    UnitPrice DECIMAL(18,2) NOT NULL,
    TotalPrice DECIMAL(18,2) NOT NULL,
    IsReadyForPickup BOOLEAN NOT NULL DEFAULT FALSE,
    MarkedReadyAt TIMESTAMP NULL,
    PickupQRCode VARCHAR(100),
    IsPickedUp BOOLEAN NOT NULL DEFAULT FALSE,
    PickedUpAt TIMESTAMP NULL,
    CONSTRAINT FK_OrderItems_Orders FOREIGN KEY (OrderId) REFERENCES Orders (Id) ON DELETE CASCADE,
    CONSTRAINT FK_OrderItems_Vendors FOREIGN KEY (VendorId) REFERENCES Vendors (Id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS IX_OrderItems_OrderId ON OrderItems (OrderId);
CREATE INDEX IF NOT EXISTS IX_OrderItems_VendorId ON OrderItems (VendorId);
CREATE INDEX IF NOT EXISTS IX_OrderItems_ProductId ON OrderItems (ProductId);

ALTER TABLE OrderItems ENABLE ROW LEVEL SECURITY;

SELECT drop_policy_if_exists('OrderItems', 'Service role can manage order items');
CREATE POLICY "Service role can manage order items"
ON OrderItems FOR ALL TO service_role
USING (true) WITH CHECK (true);

SELECT drop_policy_if_exists('OrderItems', 'Buyers can read their order items');
CREATE POLICY "Buyers can read their order items"
ON OrderItems FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM Orders WHERE Orders.Id = OrderItems.OrderId AND Orders.BuyerId = auth.uid()::text));

SELECT drop_policy_if_exists('OrderItems', 'Vendors can read their order items');
CREATE POLICY "Vendors can read their order items"
ON OrderItems FOR SELECT TO authenticated
USING (auth.uid()::text = VendorId);

-- Payments Table
CREATE TABLE IF NOT EXISTS Payments (
    Id SERIAL PRIMARY KEY,
    OrderId INTEGER NOT NULL UNIQUE,
    TransactionId VARCHAR(100) NOT NULL UNIQUE,
    Amount DECIMAL(18,2) NOT NULL,
    Status INTEGER NOT NULL DEFAULT 0,
    Method VARCHAR(50) NOT NULL,
    IsEscrow BOOLEAN NOT NULL DEFAULT FALSE,
    EscrowReleasedAt TIMESTAMP NULL,
    VendorsPaid BOOLEAN NOT NULL DEFAULT FALSE,
    TransporterPaid BOOLEAN NOT NULL DEFAULT FALSE,
    PlatformPaid BOOLEAN NOT NULL DEFAULT FALSE,
    VendorPayout DECIMAL(18,2),
    TransporterPayout DECIMAL(18,2),
    PlatformCommission DECIMAL(18,2),
    CreatedAt TIMESTAMP NOT NULL DEFAULT NOW(),
    CompletedAt TIMESTAMP NULL,
    CONSTRAINT FK_Payments_Orders FOREIGN KEY (OrderId) REFERENCES Orders (Id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS IX_Payments_OrderId ON Payments (OrderId);
CREATE INDEX IF NOT EXISTS IX_Payments_TransactionId ON Payments (TransactionId);
CREATE INDEX IF NOT EXISTS IX_Payments_Status ON Payments (Status);

ALTER TABLE Payments ENABLE ROW LEVEL SECURITY;

SELECT drop_policy_if_exists('Payments', 'Service role can manage payments');
CREATE POLICY "Service role can manage payments"
ON Payments FOR ALL TO service_role
USING (true) WITH CHECK (true);

SELECT drop_policy_if_exists('Payments', 'Buyers can read their payments');
CREATE POLICY "Buyers can read their payments"
ON Payments FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM Orders WHERE Orders.Id = Payments.OrderId AND Orders.BuyerId = auth.uid()::text));

-- Carts Table
CREATE TABLE IF NOT EXISTS Carts (
    Id SERIAL PRIMARY KEY,
    BuyerId VARCHAR(450) NOT NULL UNIQUE,
    CreatedAt TIMESTAMP NOT NULL DEFAULT NOW(),
    UpdatedAt TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT FK_Carts_Buyers FOREIGN KEY (BuyerId) REFERENCES Buyers (Id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS IX_Carts_BuyerId ON Carts (BuyerId);

ALTER TABLE Carts ENABLE ROW LEVEL SECURITY;

SELECT drop_policy_if_exists('Carts', 'Service role can manage carts');
CREATE POLICY "Service role can manage carts"
ON Carts FOR ALL TO service_role
USING (true) WITH CHECK (true);

SELECT drop_policy_if_exists('Carts', 'Buyers can manage their own cart');
CREATE POLICY "Buyers can manage their own cart"
ON Carts FOR ALL TO authenticated
USING (auth.uid()::text = BuyerId) WITH CHECK (auth.uid()::text = BuyerId);

-- CartItems Table
CREATE TABLE IF NOT EXISTS CartItems (
    Id SERIAL PRIMARY KEY,
    CartId INTEGER NOT NULL,
    ProductId INTEGER NOT NULL,
    VendorId VARCHAR(450) NOT NULL,
    ProductName VARCHAR(200) NOT NULL,
    Quantity DECIMAL(10,2) NOT NULL,
    Unit VARCHAR(20) NOT NULL,
    UnitPrice DECIMAL(18,2) NOT NULL,
    AddedAt TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT FK_CartItems_Carts FOREIGN KEY (CartId) REFERENCES Carts (Id) ON DELETE CASCADE,
    CONSTRAINT FK_CartItems_Vendors FOREIGN KEY (VendorId) REFERENCES Vendors (Id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS IX_CartItems_CartId ON CartItems (CartId);
CREATE INDEX IF NOT EXISTS IX_CartItems_ProductId ON CartItems (ProductId);
CREATE INDEX IF NOT EXISTS IX_CartItems_VendorId ON CartItems (VendorId);

ALTER TABLE CartItems ENABLE ROW LEVEL SECURITY;

SELECT drop_policy_if_exists('CartItems', 'Service role can manage cart items');
CREATE POLICY "Service role can manage cart items"
ON CartItems FOR ALL TO service_role
USING (true) WITH CHECK (true);

SELECT drop_policy_if_exists('CartItems', 'Buyers can manage their cart items');
CREATE POLICY "Buyers can manage their cart items"
ON CartItems FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM Carts WHERE Carts.Id = CartItems.CartId AND Carts.BuyerId = auth.uid()::text))
WITH CHECK (EXISTS (SELECT 1 FROM Carts WHERE Carts.Id = CartItems.CartId AND Carts.BuyerId = auth.uid()::text));

-- ============================================
-- MARKETPLACE DOMAIN TABLES
-- ============================================

-- Categories Table
CREATE TABLE IF NOT EXISTS Categories (
    Id SERIAL PRIMARY KEY,
    Name VARCHAR(100) NOT NULL,
    Description TEXT,
    ImageUrl VARCHAR(500),
    IsActive BOOLEAN NOT NULL DEFAULT TRUE,
    CreatedAt TIMESTAMP NOT NULL DEFAULT NOW()
);

ALTER TABLE Categories ENABLE ROW LEVEL SECURITY;

SELECT drop_policy_if_exists('Categories', 'Service role can manage categories');
CREATE POLICY "Service role can manage categories"
ON Categories FOR ALL TO service_role
USING (true) WITH CHECK (true);

SELECT drop_policy_if_exists('Categories', 'Anyone can read active categories');
CREATE POLICY "Anyone can read active categories"
ON Categories FOR SELECT TO authenticated
USING (IsActive = true);

-- ============================================
-- LOGISTICS DOMAIN TABLES
-- ============================================

-- DeliveryTracking Table
CREATE TABLE IF NOT EXISTS DeliveryTracking (
    Id SERIAL PRIMARY KEY,
    OrderId INTEGER NOT NULL,
    TransporterId VARCHAR(450) NOT NULL,
    Latitude VARCHAR(50) NOT NULL,
    Longitude VARCHAR(50) NOT NULL,
    Timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
    Speed DECIMAL(5,2),
    Heading INTEGER
);

CREATE INDEX IF NOT EXISTS IX_DeliveryTracking_OrderId ON DeliveryTracking (OrderId);
CREATE INDEX IF NOT EXISTS IX_DeliveryTracking_TransporterId ON DeliveryTracking (TransporterId);
CREATE INDEX IF NOT EXISTS IX_DeliveryTracking_Timestamp ON DeliveryTracking (Timestamp);

ALTER TABLE DeliveryTracking ENABLE ROW LEVEL SECURITY;

SELECT drop_policy_if_exists('DeliveryTracking', 'Service role can manage delivery tracking');
CREATE POLICY "Service role can manage delivery tracking"
ON DeliveryTracking FOR ALL TO service_role
USING (true) WITH CHECK (true);

SELECT drop_policy_if_exists('DeliveryTracking', 'Buyers can read tracking for their orders');
CREATE POLICY "Buyers can read tracking for their orders"
ON DeliveryTracking FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM Orders WHERE Orders.Id = DeliveryTracking.OrderId AND Orders.BuyerId = auth.uid()::text));

SELECT drop_policy_if_exists('DeliveryTracking', 'Transporters can manage their delivery tracking');
CREATE POLICY "Transporters can manage their delivery tracking"
ON DeliveryTracking FOR ALL TO authenticated
USING (auth.uid()::text = TransporterId)
WITH CHECK (auth.uid()::text = TransporterId);

-- Routes Table
CREATE TABLE IF NOT EXISTS Routes (
    Id SERIAL PRIMARY KEY,
    OrderId INTEGER NOT NULL,
    TransporterId VARCHAR(450) NOT NULL,
    VendorStops JSONB NOT NULL,
    BuyerLocation JSONB NOT NULL,
    OptimizedRoute JSONB,
    EstimatedDistance DECIMAL(10,2),
    EstimatedDuration INTEGER,
    CreatedAt TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS IX_Routes_OrderId ON Routes (OrderId);
CREATE INDEX IF NOT EXISTS IX_Routes_TransporterId ON Routes (TransporterId);

ALTER TABLE Routes ENABLE ROW LEVEL SECURITY;

SELECT drop_policy_if_exists('Routes', 'Service role can manage routes');
CREATE POLICY "Service role can manage routes"
ON Routes FOR ALL TO service_role
USING (true) WITH CHECK (true);

SELECT drop_policy_if_exists('Routes', 'Buyers can read routes for their orders');
CREATE POLICY "Buyers can read routes for their orders"
ON Routes FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM Orders WHERE Orders.Id = Routes.OrderId AND Orders.BuyerId = auth.uid()::text));

SELECT drop_policy_if_exists('Routes', 'Transporters can read their routes');
CREATE POLICY "Transporters can read their routes"
ON Routes FOR SELECT TO authenticated
USING (auth.uid()::text = TransporterId);

-- ============================================
-- SEED DATA
-- ============================================

INSERT INTO Categories (Name, Description, IsActive)
VALUES 
    ('Vegetables', 'Fresh vegetables', TRUE),
    ('Fruits', 'Fresh fruits', TRUE),
    ('Dairy', 'Milk and dairy products', TRUE),
    ('Grains', 'Rice, wheat, and other grains', TRUE),
    ('Pulses', 'Lentils and legumes', TRUE)
ON CONFLICT DO NOTHING;

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

CREATE OR REPLACE FUNCTION update_cart_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE Carts 
    SET UpdatedAt = NOW() 
    WHERE Id = NEW.CartId;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS cart_items_updated ON CartItems;
CREATE TRIGGER cart_items_updated
AFTER INSERT OR UPDATE OR DELETE ON CartItems
FOR EACH ROW
EXECUTE FUNCTION update_cart_updated_at();

-- Clean up helper function
DROP FUNCTION drop_policy_if_exists(text, text);
