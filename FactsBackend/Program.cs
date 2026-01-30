// Forced reload trigger
using Microsoft.EntityFrameworkCore;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

builder.Services.Configure<Microsoft.AspNetCore.Http.Json.JsonOptions>(options =>
{
    options.SerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowTauri",
        policy =>
        {
            policy.WithOrigins("http://localhost:1420") // ajusta al puerto que uses en dev
              .AllowAnyHeader()
              .AllowAnyMethod();
        });
});

// Configurar SQLite local
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite("Data Source=facts.db"));

var app = builder.Build();

// Migraciones automáticas al iniciar (opcional)
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();
}

app.MapClientEndpoints();  // modular, limpio
app.MapInvoiceEndpoints(); // cada entidad tiene su propio archivo
app.MapServiceEndpoints();
app.MapNotificationEndpoints();

app.UseCors("AllowTauri");
app.Run();
