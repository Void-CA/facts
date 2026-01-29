using Microsoft.EntityFrameworkCore;

public static class NotificationEndpoints
{
    public static void MapNotificationEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/notifications");

        group.MapGet("/", async (AppDbContext db) => await db.Notifications.ToListAsync());

        group.MapGet("/{id:int}", async (int id, AppDbContext db) =>
            await db.Notifications.FindAsync(id) is Notification notification ? Results.Ok(notification) : Results.NotFound());

        group.MapPost("/", async (Notification notification, AppDbContext db) =>
        {
            db.Notifications.Add(notification);
            await db.SaveChangesAsync();
            return Results.Created($"/notifications/{notification.Id}", notification);
        });

        group.MapPut("/{id:int}", async (int id, Notification updated, AppDbContext db) =>
        {
            var notification = await db.Notifications.FindAsync(id);
            if (notification == null) return Results.NotFound();

            notification.Message = updated.Message;
            notification.NotificationType = updated.NotificationType;
            notification.Timestamp = updated.Timestamp;
            notification.IsRead = updated.IsRead;

            await db.SaveChangesAsync();
            return Results.NoContent();
        });

        group.MapDelete("/{id:int}", async (int id, AppDbContext db) =>
        {
            var notification = await db.Notifications.FindAsync(id);
            if (notification == null) return Results.NotFound();

            db.Notifications.Remove(notification);
            await db.SaveChangesAsync();
            return Results.NoContent();
        });
    }
}
