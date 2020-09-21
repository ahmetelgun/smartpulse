using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.Text.Json;
using System.Text;
using System.Threading.Tasks;
namespace dotnet.Models
{
    public class SmartPulseContext : DbContext
    {
        public DbSet<Organization> Organizations { get; set; }
        public DbSet<Central> Centrals { get; set; }
        public DbSet<WatchList> WatchLists { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<SavedGrid> SavedGrids { get; set; }


        /*         protected override void OnModelCreating(ModelBuilder modelBuilder)
                {
                    modelBuilder.Entity<WatchList>()
                        .HasOne(p => p.user)
                        .WithMany(b => b.watchLists);

                    modelBuilder.Entity<User>()
                        .HasMany(p => p.watchLists)
                        .WithOne(b => b.user);

                }
         */
        protected override void OnConfiguring(DbContextOptionsBuilder options)
            => options.UseSqlite("Data Source=smartpulse.db");
    }

    public class Organization
    {
        public int organizationId { get; set; }
        public string organizationName { get; set; }
        public int organizationStatus { get; set; }
        public string organizationETSOCode { get; set; }
        public string organizationShortName { get; set; }
    }

    public class Central
    {
        public Int64 id { get; set; }
        public string name { get; set; }
        public string eic { get; set; }
        public Organization? organization { get; set; }
    }

    public class OrganizationShortDefine
    {
        public List<Central> centrals { get; set; }
        public string name { get; set; }
        public string etso { get; set; }
    }

    public class KgupOrEakField
    {
        public string date { get; set; }
        public double sum { get; set; }
    }

    public class KgupOrEak
    {
        public List<KgupOrEakField>? hourly { get; set; } = new List<KgupOrEakField>();
        public List<KgupOrEakField>? daily { get; set; } = new List<KgupOrEakField>();
    }

    public class UrgentField
    {
        public string date { get; set; }
        public double powerLoss { get; set; }
    }

    public class Urgent
    {
        public int type { get; set; }
        public string reason { get; set; }
        public string urgentStartDate { get; set; }
        public List<UrgentField> hourly { get; set; }
    }

    public class Types
    {
        public KgupOrEak? kgup { get; set; }
        public KgupOrEak? eak { get; set; }
        public List<Urgent>? urgent { get; set; }

    }

    public class OrganizationProductions
    {
        public string name { get; set; }
        public string etso { get; set; }
        public List<CentralProductions> centralProductions { get; set; }
    }

    public class ProductionRequest
    {
        public string start { get; set; }
        public string end { get; set; }
        public List<int> types { get; set; }
        public List<OrganizationShortDefine> organizations { get; set; }
    }

    public class CentralProductions
    {
        public string name { get; set; }
        public Int64 id { get; set; }
        public string eic { get; set; }
        public Types types { get; set; } = new Types();
    }

    public class User
    {
        public string name { get; set; }
        public string surname { get; set; }
        [Key]
        public string email { get; set; }
        public string password { get; set; }
        public string token { get; set; }
        public string salt { get; set; }
        public List<WatchList> watchLists { get; set; }
    }

    public class WatchList
    {
        [Key]
        public int id { get; set; }
        public string name { get; set; }
        public string json { get; set; }
        public User user { get; set; }
    }
    public class SavedGrid
    {
        [Key]
        public int id { get; set; }
        public string name { get; set; }
        public string header { get; set; }
        public string rows { get; set; }
        public User user { get; set; }
    }
}