using Microsoft.EntityFrameworkCore.Migrations;

namespace aspnetapp.Migrations
{
    public partial class user_added2 : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "salt",
                table: "Users",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "salt",
                table: "Users");
        }
    }
}
