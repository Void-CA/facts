// Forced reload trigger
using System.Text.Json.Serialization;
using FactsBackend.Endpoints;
using Microsoft.EntityFrameworkCore;

public partial class Program
{
    private static void Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);

        builder.Services.Configure<Microsoft.AspNetCore.Http.Json.JsonOptions>(options =>
        {
            options.SerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
        });

        builder.Services.AddCors(options =>
        {
            options.AddPolicy(
                "AllowTauri",
                policy =>
                {
                    policy
                        .WithOrigins("http://localhost:1420") // ajusta al puerto que uses en dev
                        .AllowAnyHeader()
                        .AllowAnyMethod();
                }
            );
        });

        // Configurar SQLite local
        builder.Services.AddDbContext<AppDbContext>(options =>
            options.UseSqlite("Data Source=facts.db")
        );

        // Registrar servicios
        builder.Services.AddScoped<FactsBackend.Services.PrintService>();

        var app = builder.Build();

        // Migraciones automáticas al iniciar (opcional)
        using (var scope = app.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            db.Database.Migrate();
            SeedData(db);
        }

        app.MapClientEndpoints(); // modular, limpio
        app.MapInvoiceEndpoints(); // cada entidad tiene su propio archivo
        app.MapServiceEndpoints();
        app.MapNotificationEndpoints();
        app.MapPrintEndpoints();

        app.UseCors("AllowTauri");
        app.Run();

        static void SeedData(AppDbContext db)
        {
            if (db.Invoices.Any())
                return; // No duplicar datos

            var random = new Random();

            if (!db.Clients.Any())
            {
                var seedClients = new List<Client>
                {
                    new Client
                    {
                        Name = "Tech Solutions",
                        Email = "contacto@techsolutions.com",
                        Phone = "99887766",
                        Address = "Av. Central 123",
                        RUC = "80012345-6",
                    },
                    new Client
                    {
                        Name = "Alpha Corp",
                        Email = "ventas@alphacorp.com",
                        Phone = "99112233",
                        Address = "Calle Norte 45",
                        RUC = "80023456-7",
                    },
                    new Client
                    {
                        Name = "Global Industries",
                        Email = "info@globalind.com",
                        Phone = "99223344",
                        Address = "Ruta 2 Km 18",
                        RUC = "80034567-8",
                    },
                    new Client
                    {
                        Name = "Restaurante La Paz",
                        Email = "lapaz@rest.com",
                        Phone = "99334455",
                        Address = "Av. Gastronómica 901",
                        RUC = "80045678-9",
                    },
                    new Client
                    {
                        Name = "Importadora X",
                        Email = "compras@importadorax.com",
                        Phone = "99445566",
                        Address = "Zona Franca 12",
                        RUC = "80056789-0",
                    },
                };

                db.Clients.AddRange(seedClients);
                db.SaveChanges();
            }

            var clientIds = db.Clients.Select(c => c.Id).ToList();
            var states = new[] { "pagado", "pendiente", "vencido", "cancelado" };
            var types = new[] { "Ingreso", "Egreso", "Caja" };
            var providers = new[] { "Banco Local", "Proveedor A", "Proveedor B", "Caja Interna" };
            var printNumber = db.Invoices.Any() ? db.Invoices.Max(i => i.PrintNumber) : 1000;

            var invoices = new List<Invoice>();

            for (int year = 2024; year <= DateTime.Now.Year; year++)
            {
                for (int month = 1; month <= 12; month++)
                {
                    if (year == DateTime.Now.Year && month > DateTime.Now.Month)
                        break;

                    int invoicesThisMonth = random.Next(3, 9);
                    for (int i = 0; i < invoicesThisMonth; i++)
                    {
                        var services = new List<Service>
                        {
                            new Service
                            {
                                Quantity = random.Next(1, 5),
                                Specification = "Servicio principal",
                                Price = (decimal)(random.NextDouble() * 400 + 50),
                            },
                        };

                        if (random.NextDouble() > 0.5)
                        {
                            services.Add(
                                new Service
                                {
                                    Quantity = random.Next(1, 3),
                                    Specification = "Servicio adicional",
                                    Price = (decimal)(random.NextDouble() * 200 + 30),
                                }
                            );
                        }

                        invoices.Add(
                            new Invoice
                            {
                                ClientId = clientIds[random.Next(clientIds.Count)],
                                EmittedDate = new DateTime(year, month, random.Next(1, 28)),
                                ExpireDate = new DateTime(year, month, random.Next(1, 28)).AddDays(
                                    15
                                ),
                                State = states[random.Next(states.Length)],
                                InvoiceType = types[random.Next(types.Length)],
                                PrintNumber = ++printNumber,
                                Provider = providers[random.Next(providers.Length)],
                                ProviderName = providers[random.Next(providers.Length)],
                                Description = "Factura generada automáticamente",
                                Services = services,
                            }
                        );
                    }
                }
            }

            db.Invoices.AddRange(invoices);
            db.SaveChanges();
        }
    }
}
