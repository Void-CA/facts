using System.Drawing;
using System.Drawing.Printing;
using System.Text.Json;
using FactsBackend.Models;

namespace FactsBackend.Services;

public class InvoiceRenderer
{
    private readonly PrintLayout _layout;
    private readonly LayoutFields _fields;

    public InvoiceRenderer(PrintLayout layout)
    {
        _layout = layout;
        _fields = JsonSerializer.Deserialize<LayoutFields>(layout.FieldsJson) 
            ?? new LayoutFields();
    }

    /// <summary>
    /// Converts millimeters to pixels using the specified DPI
    /// </summary>
    private static float MmToPx(float mm, float dpi)
    {
        return mm * dpi / 25.4f;
    }

    /// <summary>
    /// Renders the invoice onto the graphics surface
    /// </summary>
    public void Render(Graphics g, Invoice invoice)
    {
        float dpi = g.DpiX;

        // Draw each field if enabled
        DrawField(g, _fields.Cliente, invoice.Client?.Name ?? "", dpi);
        DrawField(g, _fields.Ruc, invoice.Client?.RUC ?? "", dpi);
        DrawField(g, _fields.Fecha, invoice.EmittedDate.ToShortDateString(), dpi);
        DrawField(g, _fields.FechaVencimiento, invoice.ExpireDate?.ToShortDateString() ?? "", dpi);
        DrawField(g, _fields.Tipo, invoice.InvoiceType ?? "", dpi);
        DrawField(g, _fields.Numero, invoice.PrintNumber.ToString(), dpi);
        DrawField(g, _fields.Proveedor, invoice.ProviderName ?? invoice.Provider ?? "", dpi);
        
        var total = invoice.Services.Sum(s => s.Quantity * s.Price);
        DrawField(g, _fields.Total, total.ToString("C"), dpi);
        
        DrawField(g, _fields.Estado, invoice.State ?? "", dpi);
        DrawField(g, _fields.Descripcion, invoice.Description ?? "", dpi);
    }

    /// <summary>
    /// Draws a single field at its configured position
    /// </summary>
    private void DrawField(Graphics g, PrintField? field, string value, float dpi)
    {
        if (field == null || !field.Enabled || string.IsNullOrEmpty(value))
            return;

        float x = MmToPx(field.X, dpi);
        float y = MmToPx(field.Y, dpi);

        using var font = new Font(field.FontName ?? "Arial", field.FontSize);
        using var brush = new SolidBrush(Color.Black);

        g.DrawString(value, font, brush, x, y);
    }

    /// <summary>
    /// Gets the page size in hundredths of an inch for PrintDocument
    /// </summary>
    public PaperSize GetPaperSize()
    {
        // Convert mm to hundredths of an inch (1 inch = 25.4 mm, 1/100 inch units)
        int widthHundredths = (int)(_layout.PageWidthMm / 25.4f * 100);
        int heightHundredths = (int)(_layout.PageHeightMm / 25.4f * 100);

        return new PaperSize("Custom", widthHundredths, heightHundredths);
    }
}
