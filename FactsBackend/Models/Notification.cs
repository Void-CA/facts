using System.ComponentModel.DataAnnotations;

public class Notification
{
    public int Id { get; set; }

    public string Message { get; set; } = null!;

    public string NotificationType { get; set; } = "general";

    public DateTime Timestamp { get; set; } = DateTime.Now;

    public bool IsRead { get; set; } = false;
}
