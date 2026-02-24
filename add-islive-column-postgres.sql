-- PostgreSQL Migration: Add IsLive column to MasterProducts table
-- Database: Supabase PostgreSQL

DO $$
BEGIN
    -- Check if column exists
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'MasterProducts' 
        AND column_name = 'IsLive'
    ) THEN
        -- Add the column
        ALTER TABLE "MasterProducts"
        ADD COLUMN "IsLive" BOOLEAN NOT NULL DEFAULT false;
        
        RAISE NOTICE 'IsLive column added to MasterProducts table';
        
        -- Make all products live by default for testing
        UPDATE "MasterProducts"
        SET "IsLive" = true;
        
        RAISE NOTICE 'All products set to live status';
    ELSE
        RAISE NOTICE 'IsLive column already exists in MasterProducts table';
    END IF;
END $$;

-- Verify the migration
SELECT 
    COUNT(*) as total_products, 
    SUM(CASE WHEN "IsLive" = true THEN 1 ELSE 0 END) as live_products,
    SUM(CASE WHEN "IsLive" = false THEN 1 ELSE 0 END) as inactive_products
FROM "MasterProducts";

-- Show sample data
SELECT "Id", "Name", "Category", "IsLive"
FROM "MasterProducts"
ORDER BY "Name"
LIMIT 10;
