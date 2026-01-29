using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

public class Service
{
    public int Id { get; set; }

    public int InvoiceId { get; set; }
    [JsonIgnore]
    public Invoice Invoice { get; set; } = null!;

    public int Quantity { get; set; } = 1;

    public string? Specification { get; set; }

    [Range(0, double.MaxValue)]
    public decimal Price { get; set; }

    public decimal Subtotal => Quantity * Price;
}
