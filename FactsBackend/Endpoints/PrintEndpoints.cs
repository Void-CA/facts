using Microsoft.EntityFrameworkCore;
using FactsBackend.Models;
using FactsBackend.Services;

namespace FactsBackend.Endpoints;

public static class PrintEndpoints
{
    public static void MapPrintEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/print");

        // Get all print layouts
        group.MapGet("/layouts", async (AppDbContext db) =>
            await db.PrintLayouts.ToListAsync());

        // Get single layout
        group.MapGet("/layouts/{id:int}", async (int id, AppDbContext db) =>
            await db.PrintLayouts.FindAsync(id) is PrintLayout layout
                ? Results.Ok(layout)
                : Results.NotFound());

        // Create or update layout
        group.MapPost("/layouts", async (PrintLayout layout, AppDbContext db) =>
        {
            if (layout.Id == 0)
            {
                // Create new
                layout.CreatedAt = DateTime.UtcNow;
                layout.UpdatedAt = DateTime.UtcNow;
                db.PrintLayouts.Add(layout);
            }
            else
            {
                // Update existing
                var existing = await db.PrintLayouts.FindAsync(layout.Id);
                if (existing == null) return Results.NotFound();

                existing.Name = layout.Name;
                existing.PageWidthMm = layout.PageWidthMm;
                existing.PageHeightMm = layout.PageHeightMm;
                existing.PrinterName = layout.PrinterName;
                existing.FieldsJson = layout.FieldsJson;
                existing.UpdatedAt = DateTime.UtcNow;
            }

            await db.SaveChangesAsync();
            return Results.Ok(layout);
        });

        // Delete layout
        group.MapDelete("/layouts/{id:int}", async (int id, AppDbContext db) =>
        {
            var layout = await db.PrintLayouts.FindAsync(id);
            if (layout == null) return Results.NotFound();

            db.PrintLayouts.Remove(layout);
            await db.SaveChangesAsync();
            return Results.NoContent();
        });

        // Get available printers
        group.MapGet("/printers", (PrintService printService) =>
        {
            var printers = printService.GetAvailablePrinters();
            return Results.Ok(printers);
        });

        // Print invoice directly
        group.MapPost("/invoice/{invoiceId:int}", async (int invoiceId, int layoutId, PrintService printService) =>
        {
            try
            {
                var success = await printService.PrintInvoice(invoiceId, layoutId);
                return success
                    ? Results.Ok(new { message = "Print job sent successfully" })
                    : Results.Problem("Print job failed");
            }
            catch (ArgumentException ex)
            {
                return Results.BadRequest(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                return Results.Problem(
                    detail: ex.Message, 
                    title: "Fallo en el Sistema de Impresión",
                    statusCode: 500
                );
            }
        });

        // Generate preview for configuration
        group.MapPost("/preview/{invoiceId:int}", async (int invoiceId, int layoutId, PrintService printService) =>
        {
            try
            {
                var base64Image = await printService.GeneratePreview(invoiceId, layoutId);
                return Results.Ok(new { image = base64Image });
            }
            catch (ArgumentException ex)
            {
                return Results.BadRequest(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                return Results.Problem($"Preview error: {ex.Message}");
            }
        });
    }
}
