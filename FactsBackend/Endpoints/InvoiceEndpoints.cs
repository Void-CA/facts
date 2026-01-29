using Microsoft.EntityFrameworkCore;

public static class InvoiceEndpoints
{
    public static void MapInvoiceEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/invoices");

        // Main list with everything pre-loaded for performance and ease of use in React
        group.MapGet("/", async (AppDbContext db) => 
            await db.Invoices
                .Include(i => i.Client)
                .Include(i => i.Services)
                .OrderByDescending(i => i.EmittedDate)
                .ToListAsync());

        group.MapGet("/{id:int}", async (int id, AppDbContext db) =>
            await db.Invoices
                .Include(i => i.Client)
                .Include(i => i.Services)
                .FirstOrDefaultAsync(i => i.Id == id) is Invoice invoice 
                    ? Results.Ok(invoice) : Results.NotFound());

        group.MapPost("/", async (Invoice invoice, AppDbContext db) =>
        {
            // Set default date if missing
            if (invoice.EmittedDate == default) invoice.EmittedDate = DateTime.UtcNow;
            
            // Ensure Services are treated as new if Id is 0
            db.Invoices.Add(invoice);
            await db.SaveChangesAsync();
            return Results.Created($"/invoices/{invoice.Id}", invoice);
        });

        group.MapPut("/{id:int}", async (int id, Invoice updated, AppDbContext db) =>
        {
            // Crucial: We MUST Include Services to synchronize them
            var invoice = await db.Invoices
                .Include(i => i.Services)
                .FirstOrDefaultAsync(i => i.Id == id);

            if (invoice == null) return Results.NotFound();

            // Update basic fields
            invoice.ClientId = updated.ClientId;
            invoice.EmittedDate = updated.EmittedDate;
            invoice.ExpireDate = updated.ExpireDate;
            invoice.State = updated.State;
            invoice.InvoiceType = updated.InvoiceType;
            invoice.PrintNumber = updated.PrintNumber;
            invoice.Description = updated.Description;
            invoice.Provider = updated.Provider;

            // Synchronization logic for Services collection
            // 1. Remove services that are not in the 'updated' list
            var servicesToRemove = invoice.Services
                .Where(s => !updated.Services.Any(u => u.Id == s.Id && s.Id != 0))
                .ToList();
            
            foreach (var service in servicesToRemove)
            {
                db.Services.Remove(service);
            }

            // 2. Add or Update services
            foreach (var updatedService in updated.Services)
            {
                var existingService = invoice.Services.FirstOrDefault(s => s.Id == updatedService.Id && s.Id != 0);
                
                if (existingService != null)
                {
                    // Update existing
                    existingService.Quantity = updatedService.Quantity;
                    existingService.Specification = updatedService.Specification;
                    existingService.Price = updatedService.Price;
                }
                else
                {
                    // Add new (Id will be 0)
                    invoice.Services.Add(new Service
                    {
                        Quantity = updatedService.Quantity,
                        Specification = updatedService.Specification,
                        Price = updatedService.Price
                    });
                }
            }

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

        // Detailed view (Legacy support or specialized use)
        group.MapGet("/full_invoice/{id:int}", async (int id, AppDbContext db) =>
        {
            var invoice = await db.Invoices
                .Include(i => i.Client)
                .Include(i => i.Services)
                .FirstOrDefaultAsync(i => i.Id == id);

            if (invoice == null) return Results.NotFound();

            return Results.Ok(invoice);
        });
    }
}
