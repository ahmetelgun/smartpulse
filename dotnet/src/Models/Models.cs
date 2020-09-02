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
        //public DbSet<Production> Productions { get; set; }
        public DbSet<User> Users { get; set; }
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

    public class User
    {
        public string name { get; set; }
        public string surname { get; set; }
        [Key]
        public string email { get; set; }
        public string password { get; set; }
        public string token { get; set; }
        public string salt { get; set; }
    }



}