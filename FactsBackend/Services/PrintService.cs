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
        var invoice = await _db.Invoices
            .Include(i => i.Client)
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
        
        // Set printer if specified
        if (!string.IsNullOrEmpty(layout.PrinterName))
        {
            doc.PrinterSettings.PrinterName = layout.PrinterName;
        }

        var renderer = new InvoiceRenderer(layout);
        
        // Set custom paper size
        doc.DefaultPageSettings.PaperSize = renderer.GetPaperSize();
        
        // Disable margins for precise positioning
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
        catch
        {
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
        var invoice = await _db.Invoices
            .Include(i => i.Client)
            .Include(i => i.Services)
            .FirstOrDefaultAsync(i => i.Id == invoiceId);

        if (invoice == null)
            throw new ArgumentException("Invoice not found", nameof(invoiceId));

        var layout = await _db.PrintLayouts.FindAsync(layoutId);
        if (layout == null)
            throw new ArgumentException("Layout not found", nameof(layoutId));

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
}
