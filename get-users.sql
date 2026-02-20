-- Get existing users to create token with real user ID
SELECT "Id", "PhoneNumber", "Role", "FullName" 
FROM "AspNetUsers" 
WHERE "Role" = 'Vendor' OR "PhoneNumber" = '+918287433081'
LIMIT 5;
