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

namespace dotnet.Controllers
{
    public class StartupController
    {
        public static void GetOrganizations()
        {


            /* string organizationsString = Api.GetRequest("https://seffaflik.epias.com.tr/transparency/service/production/dpp-organization");
            JsonElement json = JsonDocument.Parse(organizationsString).RootElement;
            JsonElement orgs = json.GetProperty("body").GetProperty("organizations");


            using (var db = new SmartPulseContext())
            {
                foreach (var item in orgs.EnumerateArray())
                {
                    Organization temp = JsonSerializer.Deserialize<Organization>(item.GetRawText());
                    var o = db.Organizations.Where(x => x == temp).FirstOrDefault();
                    if (o == null)
                    {
                        db.Add(temp);
                    }
                }
                db.SaveChanges();
            } */
        }
    }
}