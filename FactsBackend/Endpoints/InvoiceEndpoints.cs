using ClosedXML.Excel;
using Microsoft.EntityFrameworkCore;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

public record InvoiceMonth(int Year, int Month);
public record InvoiceMonthsRequest(List<InvoiceMonth> Months);

public static class InvoiceEndpoints
{
    public static void MapInvoiceEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/invoices");

        // Main list with everything pre-loaded for performance and ease of use in React
        group.MapGet(
            "/",
            async (AppDbContext db) =>
                await db
                    .Invoices.Include(i => i.Client)
                    .Include(i => i.Services)
                    .OrderByDescending(i => i.EmittedDate)
                    .ToListAsync()
        );

        group.MapGet(
            "/{id:int}",
            async (int id, AppDbContext db) =>
                await db
                    .Invoices.Include(i => i.Client)
                    .Include(i => i.Services)
                    .FirstOrDefaultAsync(i => i.Id == id)
                    is Invoice invoice
                    ? Results.Ok(invoice)
                    : Results.NotFound()
        );

        group.MapPost(
            "/",
            async (Invoice invoice, AppDbContext db) =>
            {
                // Set default date if missing
                if (invoice.EmittedDate == default)
                    invoice.EmittedDate = DateTime.UtcNow;

                // Ensure Services are treated as new if Id is 0
                db.Invoices.Add(invoice);
                await db.SaveChangesAsync();
                return Results.Created($"/invoices/{invoice.Id}", invoice);
            }
        );

        group.MapPut(
            "/{id:int}",
            async (int id, Invoice updated, AppDbContext db) =>
            {
                // Crucial: We MUST Include Services to synchronize them
                var invoice = await db
                    .Invoices.Include(i => i.Services)
                    .FirstOrDefaultAsync(i => i.Id == id);

                if (invoice == null)
                    return Results.NotFound();

                // Update basic fields
                invoice.ClientId = updated.ClientId;
                invoice.EmittedDate = updated.EmittedDate;
                invoice.ExpireDate = updated.ExpireDate;
                invoice.State = updated.State;
                invoice.InvoiceType = updated.InvoiceType;
                invoice.PrintNumber = updated.PrintNumber;
                invoice.Description = updated.Description;
                invoice.Provider = updated.Provider;
                invoice.ProviderName = updated.ProviderName;

                // Synchronization logic for Services collection
                // 1. Remove services that are not in the 'updated' list
                var servicesToRemove = invoice
                    .Services.Where(s => !updated.Services.Any(u => u.Id == s.Id && s.Id != 0))
                    .ToList();

                foreach (var service in servicesToRemove)
                {
                    db.Services.Remove(service);
                }

                // 2. Add or Update services
                foreach (var updatedService in updated.Services)
                {
                    var existingService = invoice.Services.FirstOrDefault(s =>
                        s.Id == updatedService.Id && s.Id != 0
                    );

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
                        invoice.Services.Add(
                            new Service
                            {
                                Quantity = updatedService.Quantity,
                                Specification = updatedService.Specification,
                                Price = updatedService.Price,
                            }
                        );
                    }
                }

                await db.SaveChangesAsync();
                return Results.NoContent();
            }
        );

        group.MapDelete(
            "/{id:int}",
            async (int id, AppDbContext db) =>
            {
                var invoice = await db.Invoices.FindAsync(id);
                if (invoice == null)
                    return Results.NotFound();

                db.Invoices.Remove(invoice);
                await db.SaveChangesAsync();
                return Results.NoContent();
            }
        );

        // Detailed view (Legacy support or specialized use)
        group.MapGet(
            "/full_invoice/{id:int}",
            async (int id, AppDbContext db) =>
            {
                var invoice = await db
                    .Invoices.Include(i => i.Client)
                    .Include(i => i.Services)
                    .FirstOrDefaultAsync(i => i.Id == id);

                if (invoice == null)
                    return Results.NotFound();

                return Results.Ok(invoice);
            }
        );

        group.MapGet(
            "/last-print-number",
            async (AppDbContext db) =>
            {
                var lastNumber = await db
                    .Invoices.OrderByDescending(i => i.PrintNumber)
                    .Select(i => i.PrintNumber)
                    .FirstOrDefaultAsync();
                return Results.Ok(lastNumber);
            }
        );

        group.MapPost(
            "/by-months",
            async (InvoiceMonthsRequest request, AppDbContext db) =>
            {
                if (request?.Months == null || request.Months.Count == 0)
                    return Results.Ok(new List<Invoice>());

                if (request.Months.Any(m => m.Month < 1 || m.Month > 12))
                    return Results.BadRequest("Invalid month.");

                var monthKeys = request.Months
                    .Select(m => (m.Year * 100) + m.Month)
                    .Distinct()
                    .ToList();

                var invoices = await db
                    .Invoices.Include(i => i.Client)
                    .Include(i => i.Services)
                    .Where(i => monthKeys.Contains((i.EmittedDate.Year * 100) + i.EmittedDate.Month))
                    .OrderByDescending(i => i.EmittedDate)
                    .ToListAsync();

                return Results.Ok(invoices);
            }
        );

        group.MapGet(
            "/export",
            async (string? startDate, string? endDate, string? format, AppDbContext db) =>
            {
                Console.WriteLine(
                    $"Export requested: start={startDate}, end={endDate}, format={format}"
                );

                if (string.IsNullOrEmpty(startDate) || string.IsNullOrEmpty(endDate))
                {
                    return Results.BadRequest("Start or end date missing.");
                }

                if (
                    !DateTime.TryParse(startDate, out var start)
                    || !DateTime.TryParse(endDate, out var end)
                )
                {
                    return Results.BadRequest("Invalid date format.");
                }

                // Inclusive end date
                end = end.AddDays(1).AddTicks(-1);

                var invoices = await db
                    .Invoices.Include(i => i.Client)
                    .Include(i => i.Services)
                    .Where(i => i.EmittedDate >= start && i.EmittedDate <= end)
                    .OrderBy(i => i.EmittedDate)
                    .ToListAsync();

                if (format?.ToLower() == "csv")
                {
                    var csv = new System.Text.StringBuilder();
                    csv.AppendLine("Numero,Fecha,Cliente,RUC,Tipo,Proveedor,Total,Estado");

                    foreach (var inv in invoices)
                    {
                        csv.AppendLine(
                            $"{inv.PrintNumber},{inv.EmittedDate:yyyy-MM-dd},{inv.Client?.Name},\"{inv.Client?.RUC}\",{inv.InvoiceType},{inv.ProviderName ?? inv.Provider},{inv.Services.Sum(s => s.Quantity * s.Price)},{inv.State}"
                        );
                    }

                    return Results.File(
                        System.Text.Encoding.UTF8.GetBytes(csv.ToString()),
                        "text/csv",
                        $"facturas_{startDate}_{endDate}.csv"
                    );
                }

                if (format?.ToLower() == "excel")
                {
                    using var workbook = new ClosedXML.Excel.XLWorkbook();
                    var worksheet = workbook.Worksheets.Add("Facturas");

                    // Headers
                    worksheet.Cell(1, 1).Value = "Número";
                    worksheet.Cell(1, 2).Value = "Fecha";
                    worksheet.Cell(1, 3).Value = "Cliente";
                    worksheet.Cell(1, 4).Value = "RUC";
                    worksheet.Cell(1, 5).Value = "Tipo";
                    worksheet.Cell(1, 6).Value = "Proveedor";
                    worksheet.Cell(1, 7).Value = "Total";
                    worksheet.Cell(1, 8).Value = "Estado";

                    var headerRow = worksheet.Row(1);
                    headerRow.Style.Font.Bold = true;
                    headerRow.Style.Fill.BackgroundColor = ClosedXML.Excel.XLColor.FromHtml(
                        "#f97316"
                    );
                    headerRow.Style.Font.FontColor = ClosedXML.Excel.XLColor.White;

                    for (int i = 0; i < invoices.Count; i++)
                    {
                        var inv = invoices[i];
                        int row = i + 2;
                        worksheet.Cell(row, 1).Value = inv.PrintNumber;
                        worksheet.Cell(row, 2).Value = inv.EmittedDate.ToShortDateString();
                        worksheet.Cell(row, 3).Value = inv.Client?.Name;
                        worksheet.Cell(row, 4).Value = inv.Client?.RUC;
                        worksheet.Cell(row, 5).Value = inv.InvoiceType;
                        worksheet.Cell(row, 6).Value = inv.ProviderName ?? inv.Provider;
                        worksheet.Cell(row, 7).Value = inv.Services.Sum(s => s.Quantity * s.Price);
                        worksheet.Cell(row, 8).Value = inv.State;
                        worksheet.Cell(row, 7).Style.NumberFormat.Format = "$ #,##0.00";
                    }

                    worksheet.Columns().AdjustToContents();

                    using var stream = new System.IO.MemoryStream();
                    workbook.SaveAs(stream);
                    return Results.File(
                        stream.ToArray(),
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                        $"facturas_{startDate}_{endDate}.xlsx"
                    );
                }

                if (format?.ToLower() == "pdf")
                {
                    QuestPDF.Settings.License = QuestPDF.Infrastructure.LicenseType.Community;

                    IContainer CellStyle(IContainer container) =>
                        container
                            .DefaultTextStyle(x => x.SemiBold())
                            .PaddingVertical(5)
                            .BorderBottom(1)
                            .BorderColor("#000000");
                    IContainer ContentStyle(IContainer container) =>
                        container.BorderBottom(1).BorderColor("#EEEEEE").PaddingVertical(5);

                    var document = QuestPDF.Fluent.Document.Create(container =>
                    {
                        container.Page(page =>
                        {
                            page.Margin(1, QuestPDF.Infrastructure.Unit.Centimetre);
                            page.Header()
                                .Row(row =>
                                {
                                    row.RelativeItem()
                                        .Column(col =>
                                        {
                                            col.Item()
                                                .Text("Reporte de Facturación")
                                                .FontSize(20)
                                                .SemiBold()
                                                .FontColor("#f97316");
                                            col.Item()
                                                .Text($"{startDate} al {endDate}")
                                                .FontSize(10);
                                        });
                                });

                            page.Content()
                                .PaddingVertical(10)
                                .Table(table =>
                                {
                                    table.ColumnsDefinition(columns =>
                                    {
                                        columns.ConstantColumn(50);
                                        columns.ConstantColumn(70);
                                        columns.RelativeColumn();
                                        columns.ConstantColumn(80);
                                        columns.ConstantColumn(60);
                                    });

                                    table.Header(header =>
                                    {
                                        header.Cell().Element(CellStyle).Text("#");
                                        header.Cell().Element(CellStyle).Text("Fecha");
                                        header.Cell().Element(CellStyle).Text("Cliente");
                                        header.Cell().Element(CellStyle).Text("Total");
                                        header.Cell().Element(CellStyle).Text("Estado");
                                    });

                                    foreach (var inv in invoices)
                                    {
                                        table
                                            .Cell()
                                            .Element(ContentStyle)
                                            .Text(inv.PrintNumber.ToString());
                                        table
                                            .Cell()
                                            .Element(ContentStyle)
                                            .Text(inv.EmittedDate.ToShortDateString());
                                        table
                                            .Cell()
                                            .Element(ContentStyle)
                                            .Text(inv.Client?.Name ?? "N/A");
                                        table
                                            .Cell()
                                            .Element(ContentStyle)
                                            .Text(
                                                $"${inv.Services.Sum(s => s.Quantity * s.Price):N2}"
                                            );
                                        table.Cell().Element(ContentStyle).Text(inv.State);
                                    }
                                });

                            page.Footer()
                                .AlignCenter()
                                .Text(x =>
                                {
                                    x.Span("Página ");
                                    x.CurrentPageNumber();
                                });
                        });
                    });

                    using var stream = new System.IO.MemoryStream();
                    document.GeneratePdf(stream);
                    return Results.File(
                        stream.ToArray(),
                        "application/pdf",
                        $"facturas_{startDate}_{endDate}.pdf"
                    );
                }

                return Results.BadRequest("Unsupported format.");
            }
        );
    }
}
