using Microsoft.EntityFrameworkCore.Migrations;
using System;

#nullable disable

namespace Ordering.API.Migrations
{
    /// <inheritdoc />
    public partial class AddMissingOrderColumns : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Add columns that exist in the EF model but were missing from the
            // manually-created SQL script schema used on Render/Supabase

            // Orders table — missing columns
            migrationBuilder.Sql(@"ALTER TABLE ""Orders"" ADD COLUMN IF NOT EXISTS ""AssignedAt"" TIMESTAMP WITH TIME ZONE;");
            migrationBuilder.Sql(@"ALTER TABLE ""Orders"" ADD COLUMN IF NOT EXISTS ""BuyerName"" TEXT;");
            migrationBuilder.Sql(@"ALTER TABLE ""Orders"" ADD COLUMN IF NOT EXISTS ""VendorName"" TEXT;");
            migrationBuilder.Sql(@"ALTER TABLE ""Orders"" ADD COLUMN IF NOT EXISTS ""MandiId"" TEXT;");
            migrationBuilder.Sql(@"ALTER TABLE ""Orders"" ADD COLUMN IF NOT EXISTS ""PickupAddress"" TEXT;");
            migrationBuilder.Sql(@"ALTER TABLE ""Orders"" ADD COLUMN IF NOT EXISTS ""TransporterName"" TEXT;");
            migrationBuilder.Sql(@"ALTER TABLE ""Orders"" ADD COLUMN IF NOT EXISTS ""PaymentMethod"" TEXT;");
            migrationBuilder.Sql(@"ALTER TABLE ""Orders"" ADD COLUMN IF NOT EXISTS ""PaymentId"" TEXT;");
            migrationBuilder.Sql(@"ALTER TABLE ""Orders"" ADD COLUMN IF NOT EXISTS ""RazorpayOrderId"" TEXT;");

            // Ensure nullable columns that exist in SQL as NOT NULL are made nullable for EF
            migrationBuilder.Sql(@"ALTER TABLE ""Orders"" ALTER COLUMN ""DeliveryAddress"" DROP NOT NULL;");

            // OrderItems table — VendorId may still be NOT NULL from SQL script
            migrationBuilder.Sql(@"ALTER TABLE ""OrderItems"" DROP CONSTRAINT IF EXISTS ""FK_OrderItems_Vendors_VendorId"";");
            migrationBuilder.Sql(@"ALTER TABLE ""OrderItems"" DROP CONSTRAINT IF EXISTS ""FK_OrderItems_Vendors"";");
            migrationBuilder.Sql(@"ALTER TABLE ""OrderItems"" ALTER COLUMN ""VendorId"" DROP NOT NULL;");

            // Orders — drop Buyers/Transporters FKs (cross-service references)
            migrationBuilder.Sql(@"ALTER TABLE ""Orders"" DROP CONSTRAINT IF EXISTS ""FK_Orders_Buyers_BuyerId"";");
            migrationBuilder.Sql(@"ALTER TABLE ""Orders"" DROP CONSTRAINT IF EXISTS ""FK_Orders_Buyers"";");
            migrationBuilder.Sql(@"ALTER TABLE ""Orders"" DROP CONSTRAINT IF EXISTS ""FK_Orders_Transporters_TransporterId"";");
            migrationBuilder.Sql(@"ALTER TABLE ""Orders"" DROP CONSTRAINT IF EXISTS ""FK_Orders_Transporters"";");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Rollback intentionally omitted — these are additive safe changes
        }
    }
}
