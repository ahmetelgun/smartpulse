using Microsoft.EntityFrameworkCore.Migrations;

namespace aspnetapp.Migrations
{
    public partial class user_added3q : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Organizations",
                columns: table => new
                {
                    organizationId = table.Column<int>(nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    organizationName = table.Column<string>(nullable: true),
                    organizationStatus = table.Column<int>(nullable: false),
                    organizationETSOCode = table.Column<string>(nullable: true),
                    organizationShortName = table.Column<string>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Organizations", x => x.organizationId);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    email = table.Column<string>(nullable: false),
                    name = table.Column<string>(nullable: true),
                    surname = table.Column<string>(nullable: true),
                    password = table.Column<string>(nullable: true),
                    token = table.Column<string>(nullable: true),
                    salt = table.Column<string>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.email);
                });

            migrationBuilder.CreateTable(
                name: "Centrals",
                columns: table => new
                {
                    id = table.Column<long>(nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    name = table.Column<string>(nullable: true),
                    eic = table.Column<string>(nullable: true),
                    organizationId = table.Column<int>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Centrals", x => x.id);
                    table.ForeignKey(
                        name: "FK_Centrals_Organizations_organizationId",
                        column: x => x.organizationId,
                        principalTable: "Organizations",
                        principalColumn: "organizationId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "WatchLists",
                columns: table => new
                {
                    id = table.Column<int>(nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    name = table.Column<string>(nullable: true),
                    json = table.Column<string>(nullable: true),
                    useremail = table.Column<string>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WatchLists", x => x.id);
                    table.ForeignKey(
                        name: "FK_WatchLists_Users_useremail",
                        column: x => x.useremail,
                        principalTable: "Users",
                        principalColumn: "email",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Centrals_organizationId",
                table: "Centrals",
                column: "organizationId");

            migrationBuilder.CreateIndex(
                name: "IX_WatchLists_useremail",
                table: "WatchLists",
                column: "useremail");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Centrals");

            migrationBuilder.DropTable(
                name: "WatchLists");

            migrationBuilder.DropTable(
                name: "Organizations");

            migrationBuilder.DropTable(
                name: "Users");
        }
    }
}
