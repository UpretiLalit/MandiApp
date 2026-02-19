-- Add Language column to AspNetUsers table
ALTER TABLE "AspNetUsers" 
ADD COLUMN IF NOT EXISTS "Language" VARCHAR(10) NOT NULL DEFAULT 'en';

-- Verify the column was added
SELECT column_name, data_type, character_maximum_length, column_default, is_nullable
FROM information_schema.columns
WHERE table_name = 'AspNetUsers' AND column_name = 'Language';
