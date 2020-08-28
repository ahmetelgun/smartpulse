using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
namespace dotnet.Models
{
    public class SmartPulseContext : DbContext
    {
        public DbSet<Organization> Organizations { get; set; }
        public DbSet<Station> Stations { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Station>()
                .HasOne(p => p.organization)
                .WithMany(b => b.stations);

            modelBuilder.Entity<Organization>()
                .HasMany(b => b.stations)
                .WithOne(p => p.organization);
        }
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
        public List<Station> stations { get; set; } = new List<Station>();
    }

    public class Station
    {
        public Int64 id { get; set; }
        public string name { get; set; }
        public string eic { get; set; }
        public Organization organization { get; set; }
    }

    public class Production
    {
        public string name { get; set; }
        public string etso { get; set; }
        public string eic { get; set; }
        public string start { get; set; }
        public string end { get; set; }
        public Int64 id { get; set; }
        public List<int> types { get; set; }
    }

}