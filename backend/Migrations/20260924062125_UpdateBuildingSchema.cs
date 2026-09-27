using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PropertyManagement.Api.Migrations
{
    /// <inheritdoc />
    public partial class UpdateBuildingSchema : Migration
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
            migrationBuilder.AddColumn<string>(
                name: "Address",
                table: "Buildings",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "City",
                table: "Buildings",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Country",
                table: "Buildings",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Description",
                table: "Buildings",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ManagementNotes",
                table: "Buildings",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PostalCode",
                table: "Buildings",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Purpose",
                table: "Buildings",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "StateOrRegion",
                table: "Buildings",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Status",
                table: "Buildings",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAtUtc",
                table: "Buildings",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "UpdatedBy",
                table: "Buildings",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "YearBuilt",
                table: "Buildings",
                type: "int",
                nullable: true);
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
            migrationBuilder.DropColumn(
                name: "Address",
                table: "Buildings");

            migrationBuilder.DropColumn(
                name: "City",
                table: "Buildings");

            migrationBuilder.DropColumn(
                name: "Country",
                table: "Buildings");

            migrationBuilder.DropColumn(
                name: "Description",
                table: "Buildings");

            migrationBuilder.DropColumn(
                name: "ManagementNotes",
                table: "Buildings");

            migrationBuilder.DropColumn(
                name: "PostalCode",
                table: "Buildings");

            migrationBuilder.DropColumn(
                name: "Purpose",
                table: "Buildings");

            migrationBuilder.DropColumn(
                name: "StateOrRegion",
                table: "Buildings");

            migrationBuilder.DropColumn(
                name: "Status",
                table: "Buildings");

            migrationBuilder.DropColumn(
                name: "UpdatedAtUtc",
                table: "Buildings");

            migrationBuilder.DropColumn(
                name: "UpdatedBy",
                table: "Buildings");

            migrationBuilder.DropColumn(
                name: "YearBuilt",
                table: "Buildings");
        }
    }
}