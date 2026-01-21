-- ============================================
-- Test Data for User Testing
-- ============================================

-- IMPORTANT: Run this AFTER users are created via Identity.API
-- Replace the IDs below with actual user IDs from AspNetUsers table

-- Example Test Users (Create these via frontend registration or API):
-- Buyer 1: +919876543210 (Restaurant Owner)
-- Buyer 2: +919876543211 (Hotel Manager)
-- Vendor 1: +919876543220 (Tomato Supplier)
-- Vendor 2: +919876543221 (Onion Supplier)
-- Vendor 3: +919876543222 (Fruit Supplier)
-- Transporter 1: +919876543230 (Delivery Guy)
-- Transporter 2: +919876543231 (Truck Driver)

-- ============================================
-- STEP 1: Create Buyer Profiles
-- ============================================
-- Note: Replace 'user-id-from-aspnetusers' with actual user IDs

-- Example (UPDATE WITH REAL IDs):
/*
INSERT INTO buyers (
    "Id", "FullName", "PhoneNumber", "Email", "CompanyName", 
    "BusinessAddress", "DeliveryAddress", "CreditLimit", "IsVerified"
) VALUES 
    ('actual-user-id-1', 'Rajesh Kumar', '+919876543210', 'rajesh@hotel.com', 'Hotel Grand',
     'MG Road, Ahmedabad', 'MG Road, Ahmedabad', 100000.00, true),
    ('actual-user-id-2', 'Priya Shah', '+919876543211', 'priya@restaurant.com', 'Priya Restaurant',
     'CG Road, Ahmedabad', 'CG Road, Ahmedabad', 50000.00, true);
*/

-- ============================================
-- STEP 2: Create Vendor Profiles
-- ============================================

/*
INSERT INTO vendors (
    "Id", "FullName", "PhoneNumber", "Email", "BusinessName",
    "BusinessAddress", "Latitude", "Longitude", "IsVerified", "IsActive", "Rating"
) VALUES 
    ('actual-vendor-id-1', 'Ramesh Patel', '+919876543220', 'ramesh@freshveggies.com', 'Fresh Veggies Co.',
     'APMC Market, Ahmedabad', '23.0225', '72.5714', true, true, 4.5),
    ('actual-vendor-id-2', 'Suresh Mehta', '+919876543221', 'suresh@greenvalley.com', 'Green Valley Suppliers',
     'Sardar Patel Market, Ahmedabad', '23.0330', '72.5850', true, true, 4.7),
    ('actual-vendor-id-3', 'Mahesh Kumar', '+919876543222', 'mahesh@fruitking.com', 'Fruit King',
     'City Market, Ahmedabad', '23.0340', '72.5900', true, true, 4.3);
*/

-- ============================================
-- STEP 3: Create Transporter Profiles
-- ============================================

/*
INSERT INTO transporters (
    "Id", "FullName", "PhoneNumber", "VehicleNumber", "VehicleType",
    "IsVerified", "IsAvailable", "Rating"
) VALUES 
    ('actual-transporter-id-1', 'Vijay Singh', '+919876543230', 'GJ01AB1234', 2, true, true, 4.8),
    ('actual-transporter-id-2', 'Rakesh Kumar', '+919876543231', 'GJ01CD5678', 3, true, true, 4.6);
*/

-- ============================================
-- STEP 4: Add Vendor Inventory
-- ============================================

-- Get Product IDs first
-- SELECT "Id", "Name" FROM products ORDER BY "Id";

-- Example inventory (UPDATE WITH REAL IDs)
/*
INSERT INTO vendorinventory (
    "VendorId", "ProductId", "StockQuantity", "UnitPrice", "MinOrderQuantity", "IsAvailable"
) VALUES
    -- Vendor 1 (Tomato Supplier)
    ('vendor-id-1', 1, 500, 40.00, 5, true),    -- Tomato
    ('vendor-id-1', 2, 300, 35.00, 10, true),   -- Onion
    ('vendor-id-1', 3, 400, 25.00, 10, true),   -- Potato
    
    -- Vendor 2 (Onion Supplier)
    ('vendor-id-2', 2, 600, 32.00, 10, true),   -- Onion (cheaper)
    ('vendor-id-2', 3, 500, 23.00, 10, true),   -- Potato (cheaper)
    ('vendor-id-2', 4, 200, 50.00, 5, true),    -- Cauliflower
    
    -- Vendor 3 (Fruit Supplier)
    ('vendor-id-3', 6, 300, 120.00, 5, true),   -- Apple
    ('vendor-id-3', 7, 200, 50.00, 2, true),    -- Banana
    ('vendor-id-3', 8, 250, 80.00, 5, true);    -- Orange
*/

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check all users
SELECT * FROM "AspNetUsers" ORDER BY "PhoneNumber";

-- Check profiles
SELECT * FROM buyers;
SELECT * FROM vendors;
SELECT * FROM transporters;

-- Check products and inventory
SELECT 
    p."Name" as product,
    vi."VendorId",
    vi."StockQuantity",
    vi."UnitPrice",
    vi."IsAvailable"
FROM vendorinventory vi
JOIN products p ON vi."ProductId" = p."Id"
WHERE vi."IsAvailable" = true
ORDER BY p."Name", vi."UnitPrice";

-- Check categories
SELECT * FROM categories;

-- ============================================
-- QUICK TEST ORDER (Optional)
-- ============================================

-- After creating test data, you can create a test order via the frontend
-- Or insert test cart items for buyers to test the flow

/*
-- Example cart
INSERT INTO carts ("BuyerId", "CreatedAt", "UpdatedAt")
VALUES ('buyer-user-id-1', NOW(), NOW())
RETURNING "Id";

-- Add items to cart (use cart ID from above)
INSERT INTO cartitems (
    "CartId", "ProductId", "VendorId", "ProductName", 
    "Quantity", "Unit", "UnitPrice", "AddedAt"
) VALUES
    (1, 1, 'vendor-id-1', 'Tomato', 10, 'kg', 40.00, NOW()),
    (1, 2, 'vendor-id-2', 'Onion', 15, 'kg', 32.00, NOW());
*/

-- ============================================
-- CLEANUP (If needed during testing)
-- ============================================

-- BE CAREFUL - This deletes all test data
/*
DELETE FROM cartitems;
DELETE FROM carts;
DELETE FROM orderitems;
DELETE FROM orders;
DELETE FROM payments;
DELETE FROM vendorinventory;
DELETE FROM transporters;
DELETE FROM vendors;
DELETE FROM buyers;
*/
