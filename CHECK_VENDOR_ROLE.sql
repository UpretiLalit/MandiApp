-- Check what role vendor-001 has in the database
SELECT 
    "Id",
    "UserName",
    "PhoneNumber",
    "FullName",
    "Role",
    "Email"
FROM "AspNetUsers"
WHERE "PhoneNumber" = '+919876543211' OR "Id" = 'vendor-001';

-- Also check the role mapping
SELECT 
    u."Id",
    u."UserName",
    u."Role" as "UserRole",
    r."Name" as "MappedRole"
FROM "AspNetUsers" u
LEFT JOIN "AspNetUserRoles" ur ON u."Id" = ur."UserId"
LEFT JOIN "AspNetRoles" r ON ur."RoleId" = r."Id"
WHERE u."PhoneNumber" = '+919876543211' OR u."Id" = 'vendor-001';
