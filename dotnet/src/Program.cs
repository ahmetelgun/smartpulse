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

            //var t = DisplayCurrentInfoAsync();
            //var q = t.Result;
            //Console.WriteLine(q);
            //Thread.Sleep(10000);
            //Console.WriteLine("END ");

            StartupController.GetOrganizations();
            CreateHostBuilder(args).Build().Run();
        }

        public static async Task<string> DisplayCurrentInfoAsync()
        {
            //var t = WaitAndApologizeAsync();
            return await Task.Run(() =>
            {
                Console.WriteLine($"Today is {DateTime.Now:D}");
                Console.WriteLine($"The current time is {DateTime.Now.TimeOfDay:t}");
                Console.WriteLine("The current temperature is 76 degrees.");
                return "qwe";
            });
        }


        public static async Task<string> WaitAndApologizeAsync()
        {
            Console.WriteLine("qweqwe");
            await Task.Delay(2000);
            return await Task.Run(() =>
           {
               return "qwe";
           });
        }

        public static IHostBuilder CreateHostBuilder(string[] args) =>
            Host.CreateDefaultBuilder(args)
                .ConfigureWebHostDefaults(webBuilder =>
                {
                    webBuilder.UseStartup<Startup>();
                });
    }
}










