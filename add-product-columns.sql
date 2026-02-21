-- Run this in Supabase SQL Editor to add missing columns to Products table

-- Add IsLive column
ALTER TABLE "Products" 
ADD COLUMN IF NOT EXISTS "IsLive" BOOLEAN NOT NULL DEFAULT false;

-- Add MasterProductId column
ALTER TABLE "Products" 
ADD COLUMN IF NOT EXISTS "MasterProductId" UUID;

-- Create index on IsLive for better query performance
CREATE INDEX IF NOT EXISTS "IX_Products_IsLive" ON "Products"("IsLive");

-- Verify columns were added
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'Products'
ORDER BY ordinal_position;
