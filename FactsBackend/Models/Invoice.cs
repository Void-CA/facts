using System.ComponentModel.DataAnnotations;

public class Invoice
{
    public int Id { get; set; }

    public int ClientId { get; set; }
    public Client Client { get; set; } = null!;

    [MaxLength(100)]
    public string? Provider { get; set; }

    public DateTime EmittedDate { get; set; } = DateTime.Now;
    public DateTime? ExpireDate { get; set; }

    [Required]
    public string State { get; set; } = "pagado"; // pendiente, pagado, cancelado

    [Required]
    public string InvoiceType { get; set; } = "Ingreso"; // Ingreso, Egreso, Caja

    public int PrintNumber { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.Now;

    public string? ProviderName { get; set; }

    public string? Description { get; set; }

    public List<Service> Services { get; set; } = new();

    public decimal CalcTotal => Services.Sum(s => s.Price * s.Quantity);
}
