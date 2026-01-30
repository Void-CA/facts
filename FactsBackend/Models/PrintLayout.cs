using System.ComponentModel.DataAnnotations;

namespace FactsBackend.Models;

public class PrintLayout
{
    public int Id { get; set; }

    [Required, MaxLength(100)]
    public string Name { get; set; } = null!;

    public float PageWidthMm { get; set; } = 210f; // A4 default
    public float PageHeightMm { get; set; } = 297f; // A4 default

    [MaxLength(200)]
    public string? PrinterName { get; set; }

    // JSON string containing field configurations
    // Example: {"cliente": {"x": 30, "y": 45, "enabled": true}, ...}
    [Required]
    public string FieldsJson { get; set; } = "{}";

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

// Helper classes for deserialization
public class PrintField
{
    public float X { get; set; } // Position in mm
    public float Y { get; set; } // Position in mm
    public bool Enabled { get; set; } = true;
    public string? FontName { get; set; } = "Arial";
    public float FontSize { get; set; } = 9f;
}

public class LayoutFields
{
    public PrintField? Cliente { get; set; }
    public PrintField? Ruc { get; set; }
    public PrintField? Fecha { get; set; }
    public PrintField? FechaVencimiento { get; set; }
    public PrintField? Tipo { get; set; }
    public PrintField? Numero { get; set; }
    public PrintField? Proveedor { get; set; }
    public PrintField? Total { get; set; }
    public PrintField? Estado { get; set; }
    public PrintField? Descripcion { get; set; }
}
