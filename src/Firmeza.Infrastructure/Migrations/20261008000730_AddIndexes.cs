using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Firmeza.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddIndexes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_Enterprises_Email",
                table: "Enterprises",
                column: "Email");

            migrationBuilder.CreateIndex(
                name: "IX_Enterprises_TaxId",
                table: "Enterprises",
                column: "TaxId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Clients_Document",
                table: "Clients",
                column: "Document",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Clients_Email",
                table: "Clients",
                column: "Email");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Enterprises_Email",
                table: "Enterprises");

            migrationBuilder.DropIndex(
                name: "IX_Enterprises_TaxId",
                table: "Enterprises");

            migrationBuilder.DropIndex(
                name: "IX_Clients_Document",
                table: "Clients");

            migrationBuilder.DropIndex(
                name: "IX_Clients_Email",
                table: "Clients");
        }
    }
}
