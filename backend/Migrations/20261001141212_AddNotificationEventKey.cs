using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PropertyManagement.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddNotificationEventKey : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "NotificationKey",
                table: "Notifications",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Notifications_NotificationKey",
                table: "Notifications",
                column: "NotificationKey",
                unique: true,
                filter: "[NotificationKey] IS NOT NULL");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Notifications_NotificationKey",
                table: "Notifications");

            migrationBuilder.DropColumn(
                name: "NotificationKey",
                table: "Notifications");
        }
    }
}
