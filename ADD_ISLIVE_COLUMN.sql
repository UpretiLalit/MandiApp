-- Add IsLive column to MasterProducts table

-- Check if column exists first
IF NOT EXISTS (SELECT * FROM sys.columns 
               WHERE object_id = OBJECT_ID(N'[dbo].[MasterProducts]') 
               AND name = 'IsLive')
BEGIN
    ALTER TABLE [dbo].[MasterProducts]
    ADD [IsLive] BIT NOT NULL DEFAULT 0;
    
    PRINT 'IsLive column added to MasterProducts table';
END
ELSE
BEGIN
    PRINT 'IsLive column already exists in MasterProducts table';
END
GO

-- Optionally, make some products live by default for testing
-- UPDATE [dbo].[MasterProducts]
-- SET [IsLive] = 1
-- WHERE Category IN ('Vegetable', 'Fruit');

SELECT COUNT(*) as TotalProducts, 
       SUM(CASE WHEN IsLive = 1 THEN 1 ELSE 0 END) as LiveProducts
FROM [dbo].[MasterProducts];
