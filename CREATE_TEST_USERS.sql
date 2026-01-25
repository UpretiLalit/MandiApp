-- ============================================
-- Create Test Users in AspNetUsers
-- These users can login via OTP (123456 in dev mode)
-- ============================================

-- Create test users (OTP-based, no password needed)
INSERT INTO "AspNetUsers" (
    "Id", "UserName", "NormalizedUserName", 
    "PhoneNumber", "PhoneNumberConfirmed",
    "Email", "NormalizedEmail", "EmailConfirmed",
    "FullName", "Role", "IsActive",
    "SecurityStamp", "ConcurrencyStamp", "CreatedAt",
    "Language", "CompanyName", "Address",
    "TwoFactorEnabled", "LockoutEnabled", "AccessFailedCount"
)
VALUES 
-- Buyer User
(
    'buyer-001',
    '+919876543210',
    '+919876543210',
    '+919876543210',
    TRUE,
    'buyer@restaurant.com',
    'BUYER@RESTAURANT.COM',
    TRUE,
    'Restaurant ABC',
    'Buyer',
    TRUE,
    gen_random_uuid()::text,
    gen_random_uuid()::text,
    NOW(),
    'en',
    'Restaurant ABC Ltd',
    'Shop 23, Food Street, Ahmedabad',
    FALSE,
    FALSE,
    0
),
-- Vendor User 1
(
    'vendor-001',
    '+919876543211',
    '+919876543211',
    '+919876543211',
    TRUE,
    'ramesh@freshfarms.com',
    'RAMESH@FRESHFARMS.COM',
    TRUE,
    'Ramesh Kumar',
    'Vendor',
    TRUE,
    gen_random_uuid()::text,
    gen_random_uuid()::text,
    NOW(),
    'en',
    'Fresh Farms',
    'Plot 45, Agricultural Market, Ahmedabad',
    FALSE,
    FALSE,
    0
),
-- Vendor User 2
(
    'vendor-002',
    '+919876543212',
    '+919876543212',
    '+919876543212',
    TRUE,
    'suresh@greenvalley.com',
    'SURESH@GREENVALLEY.COM',
    TRUE,
    'Suresh Patel',
    'Vendor',
    TRUE,
    gen_random_uuid()::text,
    gen_random_uuid()::text,
    NOW(),
    'en',
    'Green Valley',
    'Warehouse 12, APMC Market, Ahmedabad',
    FALSE,
    FALSE,
    0
),
-- Transporter User
(
    'transporter-001',
    '+919876543213',
    '+919876543213',
    '+919876543213',
    TRUE,
    'vijay@transport.com',
    'VIJAY@TRANSPORT.COM',
    TRUE,
    'Vijay Singh',
    'Transporter',
    TRUE,
    gen_random_uuid()::text,
    gen_random_uuid()::text,
    NOW(),
    'en',
    'Swift Logistics',
    'Transport Nagar, Ahmedabad',
    FALSE,
    FALSE,
    0
),
-- Admin User
(
    'admin-001',
    '+919999999999',
    '+919999999999',
    '+919999999999',
    TRUE,
    'admin@mandi.app',
    'ADMIN@MANDI.APP',
    TRUE,
    'System Administrator',
    'Admin',
    TRUE,
    gen_random_uuid()::text,
    gen_random_uuid()::text,
    NOW(),
    'en',
    'MandiApp',
    'Head Office, Ahmedabad',
    FALSE,
    FALSE,
    0
)
ON CONFLICT ("Id") DO UPDATE SET
    "PhoneNumber" = EXCLUDED."PhoneNumber",
    "FullName" = EXCLUDED."FullName",
    "Email" = EXCLUDED."Email",
    "Role" = EXCLUDED."Role",
    "IsActive" = TRUE,
    "PhoneNumberConfirmed" = TRUE;

-- Link users to roles
INSERT INTO "AspNetUserRoles" ("UserId", "RoleId")
VALUES 
('buyer-001', 'role-buyer'),
('vendor-001', 'role-vendor'),
('vendor-002', 'role-vendor'),
('transporter-001', 'role-transporter'),
('admin-001', 'role-admin')
ON CONFLICT DO NOTHING;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Test users created successfully!';
    RAISE NOTICE '📱 Login credentials (OTP: 123456 in dev mode):';
    RAISE NOTICE '   Buyer: +919876543210';
    RAISE NOTICE '   Vendor 1: +919876543211 (Ramesh Kumar)';
    RAISE NOTICE '   Vendor 2: +919876543212 (Suresh Patel)';
    RAISE NOTICE '   Transporter: +919876543213 (Vijay Singh)';
    RAISE NOTICE '   Admin: +919999999999';
END $$;
