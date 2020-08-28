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

namespace dotnet
{
    public class Program
    {
        public static void Main(string[] args)
        {
            /* 
                        string organizationsString = Api.GetRequest("https://seffaflik.epias.com.tr/transparency/service/production/dpp-organization");
                        JsonElement json = JsonDocument.Parse(organizationsString).RootElement;
                        JsonElement orgs = json.GetProperty("body").GetProperty("organizations");


                        using (var db = new SmartPulseContext())
                        {
                            foreach (var item in orgs.EnumerateArray())
                            {
                                Organization temp = JsonSerializer.Deserialize<Organization>(item.GetRawText());
                                db.Add(temp);
                            }
                            db.SaveChanges();

                        } */
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














/*

public class Program
{
    public static dynamic organizations;
    static string GetRequest(string url)
    {
        HttpWebRequest request = (HttpWebRequest)WebRequest.Create(url);
        request.Method = "GET";
        var webResponse = request.GetResponse();
        var webStream = webResponse.GetResponseStream();
        var responseReader = new StreamReader(webStream);
        var response = responseReader.ReadToEnd();
        responseReader.Close();
        return response;
    }
    public static void Main(string[] args)
    {

        var options = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            WriteIndented = true
        };

        Console.WriteLine("////// PROGRAM //////");

        const string url = "https://seffaflik.epias.com.tr/transparency/service/production/dpp-organization";

        string response = GetRequest(url);
        dynamic array = JsonDocument.Parse(response);
        var root = array.RootElement;
        if (root.GetProperty("resultDescription").GetString() == "success")
        {
            organizations = root.GetProperty("body").GetProperty("organizations");
        }
        Console.WriteLine(organizations);

        Console.WriteLine("////// PROGRAM //////");
    }
}


*/