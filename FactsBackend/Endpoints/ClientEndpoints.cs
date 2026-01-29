using Microsoft.EntityFrameworkCore;

public static class ClientEndpoints
{
    public static void MapClientEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/clients");

        group.MapGet("/", async (AppDbContext db) => await db.Clients.ToListAsync());

        group.MapGet("/{id:int}", async (int id, AppDbContext db) =>
            await db.Clients.FindAsync(id) is Client client ? Results.Ok(client) : Results.NotFound());

        group.MapPost("/", async (Client client, AppDbContext db) =>
        {
            db.Clients.Add(client);
            await db.SaveChangesAsync();
            return Results.Created($"/clients/{client.Id}", client);
        });

        group.MapPut("/{id:int}", async (int id, Client updated, AppDbContext db) =>
        {
            var client = await db.Clients.FindAsync(id);
            if (client == null) return Results.NotFound();

            client.Name = updated.Name;
            client.Address = updated.Address;
            client.Phone = updated.Phone;
            client.RUC = updated.RUC;

            await db.SaveChangesAsync();
            return Results.NoContent();
        });

        group.MapDelete("/{id:int}", async (int id, AppDbContext db) =>
        {
            var client = await db.Clients.FindAsync(id);
            if (client == null) return Results.NotFound();

            db.Clients.Remove(client);
            await db.SaveChangesAsync();
            return Results.NoContent();
        });
    }
}
