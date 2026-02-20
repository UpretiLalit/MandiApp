-- Create vendor user in Supabase database
-- Run this in Supabase SQL Editor

INSERT INTO "AspNetUsers" (
    "Id",
    "UserName",
    "NormalizedUserName",
    "PhoneNumber",
    "PhoneNumberConfirmed",
    "FullName",
    "Role",
    "Language",
    "IsActive",
    "CreatedAt",
    "SecurityStamp",
    "ConcurrencyStamp"
) VALUES (
    gen_random_uuid()::text,
    '+918287433081',
    '+918287433081',
    '+918287433081',
    true,
    'Test Vendor',
    'Vendor',
    'en',
    true,
    NOW(),
    gen_random_uuid()::text,
    gen_random_uuid()::text
)
ON CONFLICT ("UserName") DO NOTHING;

-- Verify user was created
SELECT "Id", "PhoneNumber", "Role", "FullName" 
FROM "AspNetUsers" 
WHERE "PhoneNumber" = '+918287433081';
