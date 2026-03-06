using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Ordering.API.Migrations
{
    /// <inheritdoc />
    public partial class DropVendorFkFromOrderItems : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Drop FK_OrderItems_Vendors_VendorId — VendorId is a cross-service reference
            // (vendor IDs come from the Marketplace service, not from the local Vendors table)
            migrationBuilder.Sql(@"ALTER TABLE ""OrderItems"" DROP CONSTRAINT IF EXISTS ""FK_OrderItems_Vendors_VendorId"";");
            migrationBuilder.Sql(@"ALTER TABLE ""OrderItems"" DROP CONSTRAINT IF EXISTS ""FK_OrderItems_Vendors"";");

            // Drop the index on VendorId that EF created alongside the FK (safe to keep but matches snapshot)
            migrationBuilder.Sql(@"DROP INDEX IF EXISTS ""IX_OrderItems_VendorId"";");

            // Make VendorId nullable to handle cases where vendor info isn't available
            migrationBuilder.Sql(@"ALTER TABLE ""OrderItems"" ALTER COLUMN ""VendorId"" DROP NOT NULL;");

            // Drop FK on Orders.BuyerId — BuyerId is a cross-service user identity reference
            migrationBuilder.Sql(@"ALTER TABLE ""Orders"" DROP CONSTRAINT IF EXISTS ""FK_Orders_Buyers_BuyerId"";");
            migrationBuilder.Sql(@"ALTER TABLE ""Orders"" DROP CONSTRAINT IF EXISTS ""FK_Orders_Buyers"";");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Re-creating these FKs on rollback is intentionally omitted
            // as they reference cross-service tables
        }
    }
}
