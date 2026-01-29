using System.ComponentModel.DataAnnotations;

public class Client
{
    public int Id { get; set; }

    [Required, MaxLength(100)]
    public string Name { get; set; } = null!;

    [MaxLength(200)]
    public string? Address { get; set; }

    [RegularExpression(@"^\d{7,15}$", ErrorMessage = "Número inválido")]
    public string? Phone { get; set; }

    [MaxLength(20)]
    public string RUC { get; set; } = "None";

    public List<Invoice> Invoices { get; set; } = new();
}
