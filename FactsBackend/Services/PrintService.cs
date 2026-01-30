using System.Drawing.Printing;
using System.Text.Json;
using FactsBackend.Models;
using Microsoft.EntityFrameworkCore;

namespace FactsBackend.Services;

public class PrintService
{
    private readonly AppDbContext _db;

    public PrintService(AppDbContext db)
    {
        _db = db;
    }

    /// <summary>
    /// Prints an invoice directly to the specified printer without preview
    /// </summary>
    public async Task<bool> PrintInvoice(int invoiceId, int layoutId)
    {
        var invoice = await _db
            .Invoices.Include(i => i.Client)
            .Include(i => i.Services)
            .FirstOrDefaultAsync(i => i.Id == invoiceId);

        if (invoice == null)
            throw new ArgumentException("Invoice not found", nameof(invoiceId));

        var layout = await _db.PrintLayouts.FindAsync(layoutId);
        if (layout == null)
            throw new ArgumentException("Layout not found", nameof(layoutId));

        return PrintInvoiceDirect(invoice, layout);
    }

    /// <summary>
    /// Prints invoice directly to printer
    /// </summary>
    private bool PrintInvoiceDirect(Invoice invoice, PrintLayout layout)
    {
       var doc = new PrintDocument();
        doc.PrintController = new StandardPrintController(); // No olvides esto para el error de diálogo

        // VALIDACIÓN DE SEGURIDAD
        bool printerExists = PrinterSettings.InstalledPrinters
            .Cast<string>()
            .Any(p => p == layout.PrinterName);

        if (!printerExists)
        {
            throw new Exception($"La impresora '{layout.PrinterName}' no está instalada o no es accesible para el usuario del servidor.");
        }

        doc.PrinterSettings.PrinterName = layout.PrinterName;

        var renderer = new InvoiceRenderer(layout);
        doc.DefaultPageSettings.PaperSize = renderer.GetPaperSize();
        doc.DefaultPageSettings.Margins = new Margins(0, 0, 0, 0);

        doc.PrintPage += (s, e) =>
        {
            if (e.Graphics != null)
            {
                renderer.Render(e.Graphics, invoice);
            }
        };

        try
        {
            doc.Print();
            return true;
        }
        catch (Exception ex)
        {
            // Loguea el error real para que no sea un misterio
            Console.WriteLine($"Error de impresión: {ex.Message}");
            return false;
        }
    }

    /// <summary>
    /// Gets list of available printers on the system
    /// </summary>
    public List<string> GetAvailablePrinters()
    {
        var printers = new List<string>();

        foreach (string printer in PrinterSettings.InstalledPrinters)
        {
            printers.Add(printer);
        }

        return printers;
    }

    /// <summary>
    /// Generates a preview image for configuration purposes
    /// Returns base64 encoded PNG
    /// </summary>
    public async Task<string> GeneratePreview(int invoiceId, int layoutId)
    {
        var layout = await _db.PrintLayouts.FindAsync(layoutId);
        if (layout == null)
            throw new ArgumentException("Layout not found", nameof(layoutId));

        return await GeneratePreview(invoiceId, layout);
    }

    /// <summary>
    /// Generates a preview image for configuration purposes using a provided layout object
    /// Returns base64 encoded PNG
    /// </summary>
    public async Task<string> GeneratePreview(int invoiceId, PrintLayout layout)
    {
        var invoice = await _db
            .Invoices.Include(i => i.Client)
            .Include(i => i.Services)
            .FirstOrDefaultAsync(i => i.Id == invoiceId);

        if (invoice == null)
            throw new ArgumentException("Invoice not found", nameof(invoiceId));

        var renderer = new InvoiceRenderer(layout);

        // Create bitmap for preview (A4 at 96 DPI)
        int widthPx = (int)(layout.PageWidthMm * 96 / 25.4f);
        int heightPx = (int)(layout.PageHeightMm * 96 / 25.4f);

        using var bitmap = new System.Drawing.Bitmap(widthPx, heightPx);
        using var g = System.Drawing.Graphics.FromImage(bitmap);

        // White background
        g.Clear(System.Drawing.Color.White);

        // Render invoice
        renderer.Render(g, invoice);

        // Convert to base64
        using var ms = new System.IO.MemoryStream();
        bitmap.Save(ms, System.Drawing.Imaging.ImageFormat.Png);
        return Convert.ToBase64String(ms.ToArray());
    }

    public async Task<string> GeneratePreviewFromObject(int invoiceId, PrintLayout layout)
    {
        var invoice = await _db.Invoices
        .Include(i => i.Client)
        .Include(i => i.Services)
        .FirstOrDefaultAsync(i => i.Id == invoiceId) 
        ?? await _db.Invoices.Include(i => i.Client).Include(i => i.Services).FirstOrDefaultAsync();

    if (invoice == null) 
        throw new Exception("No hay facturas en la base de datos para generar una previsualización. Cree una factura primero.");


        // 2. Usar el renderer con el objeto que viene del frontend
        var renderer = new InvoiceRenderer(layout);
        
        // Calculamos píxeles a 96 DPI (estándar de pantalla)
        int widthPx = (int)(layout.PageWidthMm * 96 / 25.4f);
        int heightPx = (int)(layout.PageHeightMm * 96 / 25.4f);

        using var bitmap = new System.Drawing.Bitmap(widthPx, heightPx);
        using var g = System.Drawing.Graphics.FromImage(bitmap);
        
        g.Clear(System.Drawing.Color.White);
        renderer.Render(g, invoice);

        using var ms = new System.IO.MemoryStream();
        bitmap.Save(ms, System.Drawing.Imaging.ImageFormat.Png);
        return Convert.ToBase64String(ms.ToArray());
    }
}
