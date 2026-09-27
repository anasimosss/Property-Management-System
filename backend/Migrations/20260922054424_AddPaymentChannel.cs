using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PropertyManagement.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddPaymentChannel : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "PaymentChannel",
                table: "Payments",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PaymentChannel",
                table: "Payments");
        }
    }
}
