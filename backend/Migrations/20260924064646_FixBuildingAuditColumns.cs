using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PropertyManagement.Api.Migrations
{
    /// <inheritdoc />
    public partial class FixBuildingAuditColumns : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "CreatedBy",
                table: "Buildings",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedAtUtc",
                table: "Buildings",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "DeletedBy",
                table: "Buildings",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "Buildings",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CreatedBy",
                table: "Buildings");

            migrationBuilder.DropColumn(
                name: "DeletedAtUtc",
                table: "Buildings");

            migrationBuilder.DropColumn(
                name: "DeletedBy",
                table: "Buildings");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "Buildings");
        }
    }
}