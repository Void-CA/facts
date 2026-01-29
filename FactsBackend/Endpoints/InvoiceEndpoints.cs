using Microsoft.EntityFrameworkCore;

public static class InvoiceEndpoints
{
    public static void MapInvoiceEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/invoices");

        group.MapGet("/", async (AppDbContext db) => await db.Invoices.ToListAsync());
        group.MapGet("/{id:int}", async (int id, AppDbContext db) =>
            await db.Invoices.FindAsync(id) is Invoice invoice ? Results.Ok(invoice) : Results.NotFound());

        group.MapPost("/", async (Invoice invoice, AppDbContext db) =>
        {
            invoice.EmittedDate = DateTime.UtcNow;
            db.Invoices.Add(invoice);
            await db.SaveChangesAsync();
            return Results.Created($"/invoices/{invoice.Id}", invoice);
        });

        group.MapPut("/{id:int}", async (int id, Invoice updated, AppDbContext db) =>
        {
            var invoice = await db.Invoices.FindAsync(id);
            if (invoice == null) return Results.NotFound();

            invoice.ClientId = updated.ClientId;
            invoice.EmittedDate = updated.EmittedDate;
            invoice.ExpireDate = updated.ExpireDate;
            invoice.State = updated.State;
            invoice.InvoiceType = updated.InvoiceType;
            invoice.PrintNumber = updated.PrintNumber;
            invoice.Description = updated.Description;

            await db.SaveChangesAsync();
            return Results.NoContent();
        });

        group.MapDelete("/{id:int}", async (int id, AppDbContext db) =>
        {
            var invoice = await db.Invoices.FindAsync(id);
            if (invoice == null) return Results.NotFound();

            db.Invoices.Remove(invoice);
            await db.SaveChangesAsync();
            return Results.NoContent();
        });
    }
}
