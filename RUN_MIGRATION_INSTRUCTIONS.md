# Database Migration Instructions

## Problem
Backend services crash because database tables don't exist in Supabase PostgreSQL.

## Solution
Run the SQL migration script directly on your Supabase server.

---

## Method 1: Supabase Dashboard (Easiest)

1. **Go to Supabase Dashboard**
   - Open https://supabase.com/dashboard
   - Select your project
   
2. **Open SQL Editor**
   - Click "SQL Editor" in left sidebar
   - Click "New query"

3. **Copy and paste the entire contents of `CREATE_ALL_TABLES.sql`**

4. **Run the script**
   - Click "Run" button (or press Ctrl+Enter)
   - Wait for completion (should take 2-3 seconds)

5. **Verify tables created**
   - Go to "Table Editor" in left sidebar
   - You should see all tables: AspNetUsers, Buyers, Vendors, Products, etc.

---

## Method 2: Command Line (psql)

```bash
# Connect to Supabase PostgreSQL
psql "postgresql://postgres:PYvWmYoMYiO3RiCJ@db.iytscokxxuxprrivmzvg.supabase.co:5432/postgres"

# Run the migration script
\i D:\MandiApp\CREATE_ALL_TABLES.sql

# Or copy-paste the SQL directly
```

---

## Method 3: PowerShell Script

```powershell
# Install PostgreSQL client tools if not installed
# choco install postgresql

# Set connection string
$env:PGPASSWORD = "PYvWmYoMYiO3RiCJ"

# Run migration
psql -h db.iytscokxxuxprrivmzvg.supabase.co -p 5432 -U postgres -d postgres -f "D:\MandiApp\CREATE_ALL_TABLES.sql"
```

---

## What the Script Creates

### Identity & Authentication
- `AspNetUsers`, `AspNetRoles`, `AspNetUserRoles` (ASP.NET Identity)
- `OtpVerifications` (OTP authentication)

### Ordering System
- `Buyers`, `Vendors`, `Transporters` (User profiles)
- `Orders`, `OrderItems` (Order management)
- `Carts`, `CartItems` (Shopping cart)
- `Payments` (Payment tracking)

### Marketplace
- `Products` (Product catalog)
- `PriceHistories` (Price tracking)
- `VendorInventories` (Stock management)

### Logistics
- `Deliveries` (Delivery management)
- `LocationTrackings` (Real-time tracking)

### Sample Data
- 4 Default roles (Buyer, Vendor, Transporter, Admin)
- 1 Sample buyer
- 2 Sample vendors
- 1 Sample transporter
- 5 Sample products

---

## After Running Migration

1. **Restart all backend services:**
   ```powershell
   # Marketplace.API
   cd D:\MandiApp\Backend\Services\Marketplace.API
   dotnet run
   
   # Ordering.API  
   cd D:\MandiApp\Backend\Services\Ordering.API
   dotnet run
   
   # Identity.API
   cd D:\MandiApp\Backend\Services\Identity.API
   dotnet run
   
   # Logistics.Hub
   cd D:\MandiApp\Backend\Services\Logistics.Hub
   dotnet run
   ```

2. **Services should now start without database errors**

3. **Restart frontend:**
   ```powershell
   cd D:\MandiApp\Frontend
   ng serve
   ```

4. **Test the application:**
   - Open http://localhost:4200
   - All API errors should be resolved
   - Sample data will be available

---

## Troubleshooting

### If you get "permission denied" errors:
Your Supabase user might not have full permissions. Contact Supabase support or use the dashboard method.

### If tables already exist:
The script uses `CREATE TABLE IF NOT EXISTS` so it's safe to run multiple times.

### To drop all tables and start fresh:
```sql
-- WARNING: This deletes ALL data!
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;

-- Then run CREATE_ALL_TABLES.sql again
```

---

## Verification

After running the migration, verify with these queries in Supabase SQL Editor:

```sql
-- Check all tables created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check sample data
SELECT COUNT(*) as role_count FROM "AspNetRoles";
SELECT COUNT(*) as buyer_count FROM "Buyers";
SELECT COUNT(*) as vendor_count FROM "Vendors";
SELECT COUNT(*) as product_count FROM "Products";
```

Expected results:
- 4 roles
- 1 buyer
- 2 vendors
- 5 products

---

## Next Steps

Once tables are created and services are running:

1. ✅ Database migration complete
2. ✅ All 4 backend services running
3. ✅ Frontend rebuilt with correct config
4. 🎯 Test the application end-to-end
5. 🎯 Configure Cloudflare Tunnel (if deploying publicly)
