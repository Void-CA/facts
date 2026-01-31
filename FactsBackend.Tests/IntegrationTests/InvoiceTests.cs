using System.Net.Http.Json;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace FactsBackend.Tests.IntegrationTests
{
    public class InvoiceTests : IClassFixture<CustomWebApplicationFactory>, IDisposable
    {
        private readonly CustomWebApplicationFactory _factory;
        private readonly HttpClient _client;

        public InvoiceTests(CustomWebApplicationFactory factory)
        {
            _factory = factory;
            _client = factory.CreateClient();

            // Clean database before each test suite (or ensure created)
            using (var scope = _factory.Services.CreateScope())
            {
                var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
                db.Database.EnsureDeleted();
                db.Database.EnsureCreated();
            }
        }

        [Fact]
        public async Task GetInvoices_ReturnsEmptyList_WhenNoInvoices()
        {
            var response = await _client.GetAsync("/invoices");
            response.EnsureSuccessStatusCode();
            var invoices = await response.Content.ReadFromJsonAsync<List<Invoice>>();
            Assert.Empty(invoices);
        }

        [Fact]
        public async Task PostInvoice_CreatesInvoice_And_ReturnsCreated()
        {
            // Arrange
            var invoice = new Invoice
            {
                Client = new Client { Name = "Test Client", RUC = "123456" },
                EmittedDate = DateTime.UtcNow,
                State = "pendiente",
                InvoiceType = "Ingreso",
                Services = new List<Service> 
                { 
                    new Service { Specification = "Service 1", Quantity = 1, Price = 100 } 
                }
            };

            // Act
            var response = await _client.PostAsJsonAsync("/invoices", invoice);

            // Assert
            response.EnsureSuccessStatusCode(); // Status Code 200-299 equivalent
            // Create returns 201 Created
            Assert.Equal(System.Net.HttpStatusCode.Created, response.StatusCode);

            var createdInvoice = await response.Content.ReadFromJsonAsync<Invoice>();
            Assert.NotNull(createdInvoice);
            Assert.NotEqual(0, createdInvoice.Id);
            Assert.Equal("Test Client", createdInvoice.Client.Name);
            Assert.Single(createdInvoice.Services);
        }

        [Fact]
        public async Task PutInvoice_UpdatesInvoice_And_Services()
        {
            // Arrange - Create initial invoice
            var initialInvoice = new Invoice
            {
                Client = new Client { Name = "Update Client", RUC = "789012" },
                EmittedDate = DateTime.UtcNow,
                State = "pendiente",
                InvoiceType = "Ingreso",
                Services = new List<Service> 
                { 
                    new Service { Specification = "Initial Service", Quantity = 1, Price = 50 } 
                }
            };
            var createResponse = await _client.PostAsJsonAsync("/invoices", initialInvoice);
            var createdInvoice = await createResponse.Content.ReadFromJsonAsync<Invoice>();
            int invoiceId = createdInvoice.Id;

            // Act - Update invoice
            createdInvoice.State = "pagado";
            createdInvoice.Services[0].Price = 75; // Update existing
            createdInvoice.Services.Add(new Service { Specification = "New Service", Quantity = 2, Price = 25 }); // Add new

            var updateResponse = await _client.PutAsJsonAsync($"/invoices/{invoiceId}", createdInvoice);

            // Assert
            Assert.Equal(System.Net.HttpStatusCode.NoContent, updateResponse.StatusCode);

            // Verify update
            var getResponse = await _client.GetAsync($"/invoices/{invoiceId}");
            var updatedInvoice = await getResponse.Content.ReadFromJsonAsync<Invoice>();
            
            Assert.Equal("pagado", updatedInvoice.State);
            Assert.Equal(2, updatedInvoice.Services.Count);
            Assert.Contains(updatedInvoice.Services, s => s.Specification == "Initial Service" && s.Price == 75);
            Assert.Contains(updatedInvoice.Services, s => s.Specification == "New Service");
        }

        public void Dispose()
        {
            using (var scope = _factory.Services.CreateScope())
            {
                var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
                db.Database.EnsureDeleted();
            }
        }
    }
}
