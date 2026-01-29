using Microsoft.EntityFrameworkCore;

public static class ServiceEndpoints
{
    public static void MapServiceEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/services");

        group.MapGet("/", async (AppDbContext db) => await db.Services.ToListAsync());

        group.MapGet("/{id:int}", async (int id, AppDbContext db) =>
            await db.Services.FindAsync(id) is Service service ? Results.Ok(service) : Results.NotFound());

        group.MapPost("/", async (Service service, AppDbContext db) =>
        {
            db.Services.Add(service);
            await db.SaveChangesAsync();
            return Results.Created($"/services/{service.Id}", service);
        });

        group.MapPut("/{id:int}", async (int id, Service updated, AppDbContext db) =>
        {
            var service = await db.Services.FindAsync(id);
            if (service == null) return Results.NotFound();

            service.InvoiceId = updated.InvoiceId;
            service.Quantity = updated.Quantity;
            service.Specification = updated.Specification;
            service.Price = updated.Price;

            await db.SaveChangesAsync();
            return Results.NoContent();
        });

        group.MapDelete("/{id:int}", async (int id, AppDbContext db) =>
        {
            var service = await db.Services.FindAsync(id);
            if (service == null) return Results.NotFound();

            db.Services.Remove(service);
            await db.SaveChangesAsync();
            return Results.NoContent();
        });
    }
}
