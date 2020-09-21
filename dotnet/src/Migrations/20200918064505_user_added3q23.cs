using Microsoft.EntityFrameworkCore.Migrations;

namespace aspnetapp.Migrations
{
    public partial class user_added3q23 : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "SavedGrids",
                columns: table => new
                {
                    id = table.Column<int>(nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    name = table.Column<string>(nullable: true),
                    header = table.Column<string>(nullable: true),
                    rows = table.Column<string>(nullable: true),
                    useremail = table.Column<string>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SavedGrids", x => x.id);
                    table.ForeignKey(
                        name: "FK_SavedGrids_Users_useremail",
                        column: x => x.useremail,
                        principalTable: "Users",
                        principalColumn: "email",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_SavedGrids_useremail",
                table: "SavedGrids",
                column: "useremail");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "SavedGrids");
        }
    }
}
