using Microsoft.EntityFrameworkCore;

public class AppDbContext : DbContext
{
    public DbSet<Client> Clients => Set<Client>();
    public DbSet<Invoice> Invoices => Set<Invoice>();
    public DbSet<Service> Services => Set<Service>();
    public DbSet<Notification> Notifications => Set<Notification>();

    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options) { }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.Entity<Invoice>()
            .HasMany(i => i.Services)
            .WithOne(s => s.Invoice)
            .HasForeignKey(s => s.InvoiceId);

        modelBuilder.Entity<Client>()
            .HasMany(c => c.Invoices)
            .WithOne(i => i.Client)
            .HasForeignKey(i => i.ClientId);
    }
}
