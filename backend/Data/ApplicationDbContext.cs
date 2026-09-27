using Microsoft.EntityFrameworkCore;
using PropertyManagement.Api.Entities;

namespace PropertyManagement.Api.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<Property> Properties => Set<Property>();
    public DbSet<Building> Buildings => Set<Building>();
    public DbSet<Unit> Units => Set<Unit>();
    public DbSet<Tenant> Tenants => Set<Tenant>();
    public DbSet<Lease> Leases => Set<Lease>();
    public DbSet<Payment> Payments => Set<Payment>();
    public DbSet<Expense> Expenses => Set<Expense>();
    public DbSet<MaintenanceRequest> MaintenanceRequests => Set<MaintenanceRequest>();
    public DbSet<UnitRequest> UnitRequests => Set<UnitRequest>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // UnitRequest
modelBuilder.Entity<UnitRequest>(entity =>
{
    entity.HasKey(r => r.Id);

    entity.Property(r => r.Status)
        .HasConversion<string>()
        .HasMaxLength(50);

    entity.Property(r => r.Message)
        .HasMaxLength(500);

    entity.Property(r => r.RejectionReason)
        .HasMaxLength(500);

    // Tenant -> UnitRequest
    entity.HasOne(r => r.Tenant)
        .WithMany()
        .HasForeignKey(r => r.TenantId)
        .OnDelete(DeleteBehavior.Restrict);

    // Unit -> UnitRequest
    entity.HasOne(r => r.Unit)
        .WithMany()
        .HasForeignKey(r => r.UnitId)
        .OnDelete(DeleteBehavior.Restrict);

    // User -> UnitRequest reviewer
    entity.HasOne(r => r.ReviewedByUser)
        .WithMany()
        .HasForeignKey(r => r.ReviewedByUserId)
        .OnDelete(DeleteBehavior.NoAction);

    // Prevent duplicate pending requests at the application level.
    entity.HasIndex(r => new
    {
        r.TenantId,
        r.UnitId,
        r.Status
    });
});

        // User
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(u => u.Id);
            entity.Property(u => u.Email).IsRequired().HasMaxLength(256);
            entity.Property(u => u.PasswordHash).IsRequired();
            entity.Property(u => u.FirstName).IsRequired().HasMaxLength(100);
            entity.Property(u => u.LastName).IsRequired().HasMaxLength(100);
            entity.Property(u => u.PhoneNumber).HasMaxLength(30);
            entity.Property(u => u.Role).HasConversion<string>().HasMaxLength(50);

            entity.HasIndex(u => u.Email).IsUnique();
        });

        // Property
        modelBuilder.Entity<Property>(entity =>
        {
            entity.HasKey(p => p.Id);
            entity.Property(p => p.Name).IsRequired().HasMaxLength(200);
            entity.Property(p => p.Country).IsRequired().HasMaxLength(100);
            entity.Property(p => p.City).IsRequired().HasMaxLength(100);
            entity.Property(p => p.RegionOrSubCity).HasMaxLength(100);
            entity.Property(p => p.AddressLine1).IsRequired().HasMaxLength(200);
            entity.Property(p => p.AddressLine2).HasMaxLength(200);
            entity.Property(p => p.PostalCode).HasMaxLength(30);
            entity.Property(p => p.PropertyType).HasConversion<string>().HasMaxLength(50);
        });

        // Building (Property -> Building: Cascade)
        modelBuilder.Entity<Building>(entity =>
        {
            entity.HasKey(b => b.Id);
            entity.Property(b => b.Name).IsRequired().HasMaxLength(100);

            entity.HasOne(b => b.Property)
                .WithMany(p => p.Buildings)
                .HasForeignKey(b => b.PropertyId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Unit (Building -> Unit: Cascade)
        modelBuilder.Entity<Unit>(entity =>
        {
            entity.HasKey(u => u.Id);
            entity.Property(u => u.UnitNumber).IsRequired().HasMaxLength(50);
            entity.Property(u => u.Bathrooms).HasPrecision(3, 1);
            entity.Property(u => u.SquareFeet).HasPrecision(8, 2);
            entity.Property(u => u.TargetRent).HasPrecision(18, 2);
            entity.Property(u => u.Status).HasConversion<string>().HasMaxLength(50);

            entity.HasOne(u => u.Building)
                .WithMany(b => b.Units)
                .HasForeignKey(u => u.BuildingId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Tenant (User -> Tenant: SetNull, 1:1 optional)
        modelBuilder.Entity<Tenant>(entity =>
        {
            entity.HasKey(t => t.Id);
            entity.Property(t => t.FirstName).IsRequired().HasMaxLength(100);
            entity.Property(t => t.LastName).IsRequired().HasMaxLength(100);
            entity.Property(t => t.Email).IsRequired().HasMaxLength(256);
            entity.Property(t => t.PhoneNumber).IsRequired().HasMaxLength(30);
            entity.Property(t => t.EmergencyContactName).HasMaxLength(150);
            entity.Property(t => t.EmergencyContactPhone).HasMaxLength(30);

            entity.HasOne(t => t.User)
                .WithOne(u => u.Tenant)
                .HasForeignKey<Tenant>(t => t.UserId)
                .OnDelete(DeleteBehavior.SetNull);

            entity.HasIndex(t => t.UserId)
                .IsUnique()
                .HasFilter("[UserId] IS NOT NULL");
        });

        // Lease (Unit -> Lease: Restrict, Tenant -> Lease: Restrict)
        modelBuilder.Entity<Lease>(entity =>
        {
            entity.HasKey(l => l.Id);
            entity.Property(l => l.RentAmount).HasPrecision(18, 2);
            entity.Property(l => l.SecurityDepositAmount).HasPrecision(18, 2);
            entity.Property(l => l.Status).HasConversion<string>().HasMaxLength(50);

            entity.HasOne(l => l.Unit)
                .WithMany(u => u.Leases)
                .HasForeignKey(l => l.UnitId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(l => l.Tenant)
                .WithMany(t => t.Leases)
                .HasForeignKey(l => l.TenantId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // Payment (Lease -> Payment: Restrict)
        modelBuilder.Entity<Payment>(entity =>
        {
            entity.HasKey(p => p.Id);
            entity.Property(p => p.Amount).HasPrecision(18, 2);
            entity.Property(p => p.PaymentType).HasConversion<string>().HasMaxLength(50);
            entity.Property(p => p.PaymentMethod).HasConversion<string>().HasMaxLength(50);
            entity.Property(p => p.Status).HasConversion<string>().HasMaxLength(50);
            entity.Property(p => p.ReferenceNumber).HasMaxLength(100);
            entity.Property(p => p.Notes).HasMaxLength(500);

            entity.HasOne(p => p.Lease)
                .WithMany(l => l.Payments)
                .HasForeignKey(p => p.LeaseId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // Expense (Property -> Expense: Restrict, Building: NoAction, Unit: NoAction, User: Restrict)
        modelBuilder.Entity<Expense>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Amount).HasPrecision(18, 2);
            entity.Property(e => e.Category).HasConversion<string>().HasMaxLength(50);
            entity.Property(e => e.VendorName).IsRequired().HasMaxLength(150);
            entity.Property(e => e.Description).IsRequired().HasMaxLength(500);
            entity.Property(e => e.ReceiptUrl).HasMaxLength(500);

            entity.HasOne(e => e.Property)
                .WithMany(p => p.Expenses)
                .HasForeignKey(e => e.PropertyId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Building)
                .WithMany(b => b.Expenses)
                .HasForeignKey(e => e.BuildingId)
                .OnDelete(DeleteBehavior.NoAction);

            entity.HasOne(e => e.Unit)
                .WithMany(u => u.Expenses)
                .HasForeignKey(e => e.UnitId)
                .OnDelete(DeleteBehavior.NoAction);

            entity.HasOne(e => e.RecordedByUser)
                .WithMany(u => u.RecordedExpenses)
                .HasForeignKey(e => e.RecordedByUserId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // MaintenanceRequest (Property: Restrict, Unit: NoAction, Tenant: NoAction, ReportedByUser: NoAction, AssignedToUser: NoAction)
        modelBuilder.Entity<MaintenanceRequest>(entity =>
        {
            entity.HasKey(m => m.Id);
            entity.Property(m => m.Title).IsRequired().HasMaxLength(200);
            entity.Property(m => m.Description).IsRequired();
            entity.Property(m => m.Priority).HasConversion<string>().HasMaxLength(50);
            entity.Property(m => m.Status).HasConversion<string>().HasMaxLength(50);

            entity.HasOne(m => m.Property)
                .WithMany(p => p.MaintenanceRequests)
                .HasForeignKey(m => m.PropertyId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(m => m.Unit)
                .WithMany(u => u.MaintenanceRequests)
                .HasForeignKey(m => m.UnitId)
                .OnDelete(DeleteBehavior.NoAction);

            entity.HasOne(m => m.ReportedByTenant)
                .WithMany(t => t.MaintenanceRequests)
                .HasForeignKey(m => m.ReportedByTenantId)
                .OnDelete(DeleteBehavior.NoAction);

            entity.HasOne(m => m.ReportedByUser)
                .WithMany(u => u.ReportedMaintenanceRequests)
                .HasForeignKey(m => m.ReportedByUserId)
                .OnDelete(DeleteBehavior.NoAction);

            entity.HasOne(m => m.AssignedToUser)
                .WithMany(u => u.AssignedMaintenanceRequests)
                .HasForeignKey(m => m.AssignedToUserId)
                .OnDelete(DeleteBehavior.NoAction);
        });
    }
}
