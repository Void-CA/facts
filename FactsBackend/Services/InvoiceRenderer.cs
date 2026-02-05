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
        var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
        _fields =
            JsonSerializer.Deserialize<LayoutFields>(layout.FieldsJson, options)
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
        g.PageUnit = GraphicsUnit.Pixel;

        float dpi = g.DpiX;

        // Draw each field if enabled
        DrawField(g, _fields.Cliente, invoice.Client?.Name ?? "", dpi);
        DrawField(g, _fields.Ruc, invoice.Client?.RUC ?? "", dpi);
        DrawField(g, _fields.Fecha, invoice.EmittedDate.ToShortDateString(), dpi);
        DrawField(g, _fields.Numero, invoice.PrintNumber.ToString(), dpi);

        if (_fields.Servicios != null && _fields.Servicios.Enabled)
        {
            float startX = _fields.Servicios.X;
            float startY = _fields.Servicios.Y;
            float rowHeight = _fields.RowHeight > 0 ? _fields.RowHeight : 7f;
            using var font = new Font(
                _fields.Servicios.FontName ?? "Arial",
                _fields.Servicios.FontSize
            );
            using var brush = new SolidBrush(Color.Black);

            // Formato para alinear números a la derecha
            var alignRight = new StringFormat { Alignment = StringAlignment.Far };

            for (int i = 0; i < invoice.Services.Count; i++)
            {
                var service = invoice.Services[i];
                float currentY = startY + (i * rowHeight);
                float yPx = MmToPx(currentY, dpi);
                float xBasePx = MmToPx(startX, dpi);

                // Cantidad (Alineada a la derecha en su columna)
                g.DrawString(
                    service.Quantity.ToString(),
                    font,
                    brush,
                    xBasePx + MmToPx(_fields.Columnas.CantidadX, dpi),
                    yPx
                );

                // Descripción (Alineada a la izquierda)
                g.DrawString(
                    service.Specification,
                    font,
                    brush,
                    xBasePx + MmToPx(_fields.Columnas.DescripcionX, dpi),
                    yPx
                );

                // Precio Unitario (Derecha)
                g.DrawString(
                    service.Price.ToString("N2"),
                    font,
                    brush,
                    xBasePx + MmToPx(_fields.Columnas.PrecioX, dpi),
                    yPx,
                    alignRight
                );

                // Subtotal (Derecha)
                float subtotal = (float)(service.Quantity * service.Price);
                g.DrawString(
                    subtotal.ToString("N2"),
                    font,
                    brush,
                    xBasePx + MmToPx(_fields.Columnas.SubtotalX, dpi),
                    yPx,
                    alignRight
                );
            }
        }

        // 3. Dibujar Total Final (También alineado a la derecha si lo deseas)
        var total = invoice.Services.Sum(s => s.Quantity * s.Price);
        DrawField(g, _fields.Total, total.ToString("C"), dpi);
    }

    /// <summary>
    /// Draws a single field at its configured position
    /// </summary>
    private void DrawField(Graphics g, PrintField? field, string value, float dpi)
    {
        // Si el field es null o no está habilitado, no dibujamos nada
        if (field == null || !field.Enabled || string.IsNullOrWhiteSpace(value))
            return;

        float x = MmToPx(field.X, dpi);
        float y = MmToPx(field.Y, dpi);

        // Aseguramos un tamaño de fuente mínimo si viene en 0
        float fontSize = field.FontSize > 0 ? field.FontSize : 10;

        using var font = new Font(field.FontName ?? "Arial", fontSize);
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
