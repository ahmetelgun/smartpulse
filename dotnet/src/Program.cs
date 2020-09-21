using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using System.IO;
using System.Net;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using dotnet.API;
using dotnet.Models;
using dotnet.Controllers;
using System.Threading;
namespace dotnet
{
    public class Program
    {
        public static void Main(string[] args)
        {


            StartupController.GetOrganizations();
            CreateHostBuilder(args).Build().Run();
        }





        public static IHostBuilder CreateHostBuilder(string[] args) =>
            Host.CreateDefaultBuilder(args)
                .ConfigureWebHostDefaults(webBuilder =>
                {
                    webBuilder.UseStartup<Startup>();
                });
    }
}










