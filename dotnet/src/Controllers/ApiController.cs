using System;
using System.Net;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Text.Json;
using System.Text;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using dotnet.API;
using System.Net.Http;
using Microsoft.AspNetCore.Http;
using System.Net.Mime;
using System.Threading;
using dotnet.Models;
using System.IO;
using System.Dynamic;
namespace dotnet.Controllers
{
    [ApiController]
    [Route("/api/main")]
    public class MainController : ControllerBase
    {
        [HttpGet]
        public IActionResult Get()
        {
            var db = new SmartPulseContext();
            List<Organization> organizations = db.Organizations.OrderBy(x => x.organizationName).ToList();
            return Ok(organizations);
        }
    }

    [Route("/api/organization")]
    public class OrganizationController : ControllerBase
    {
        [HttpGet]
        public IActionResult Get(string etso)
        {
            var db = new SmartPulseContext();
            Organization organization = db.Organizations.Where(x => x.organizationETSOCode == etso).FirstOrDefault();
            if (organization == null)
            {
                return NotFound(new { StatusCode = 404 });
            }
            if (db.Stations.Where(x => x.organization == organization).ToList().Count() == 0)
            {
                string stations = Api.GetRequest($"https://seffaflik.epias.com.tr/transparency/service/production/dpp-injection-unit-name?organizationEIC={etso}");
                if (stations == "-1")
                {
                    return StatusCode(404);
                }
                JsonElement units = JsonDocument.Parse(stations).RootElement.GetProperty("body").GetProperty("injectionUnitNames");

                foreach (var item in units.EnumerateArray())
                {
                    Station temp = JsonSerializer.Deserialize<Station>(item.GetRawText());
                    temp.organization = organization;
                    db.Stations.Add(temp);
                    db.SaveChanges();

                }
            }
            var stationList = db.Stations.Where(x => x.organization == organization).ToList();
            var qq = from s in stationList select new { s.id, s.name, s.eic };
            return Ok(qq);
        }
    }

    [Route("/api/production/kgup")]
    public class ProductionController : ControllerBase
    {
        [HttpGet]
        public IActionResult Get(string etso, string eic, string start, string end)
        {
            string production = Api.GetRequest($"https://seffaflik.epias.com.tr/transparency/service/production/dpp?organizationEIC={etso}&uevcbEIC={eic}&startDate={start}&endDate={end}");
            if (production == "-1")
            {
                return StatusCode(500);
            }
            JsonElement json = JsonDocument.Parse(production).RootElement;
            Response.Headers.Add("Cache-Control", "public, s-maxage=1000");
            return Ok(json);
        }
    }

    [Route("/api/production/eak")]
    public class Production2Controller : ControllerBase
    {
        [HttpGet]
        public IActionResult Get(string etso, string eic, string start, string end)
        {
            string production = Api.GetRequest($"https://seffaflik.epias.com.tr/transparency/service/production/aic?organizationEIC={etso}&uevcbEIC={eic}&startDate={start}&endDate={end}");
            if (production == "-1")
            {
                return StatusCode(500);
            }
            JsonElement json = JsonDocument.Parse(production).RootElement;
            Response.Headers.Add("Cache-Control", "public, s-maxage=1000");
            return Ok(json);
        }
    }
    [Route("/api/urgent")]
    public class UrgentController : ControllerBase
    {
        [HttpGet]
        public IActionResult Get(int regionid, string start, string end, int uevcbid)
        {
            string production = Api.GetRequest($"https://seffaflik.epias.com.tr/transparency/service/production/urgent-market-message?startDate={start}&endDate={end}&regionId={regionid}&uevcbId={uevcbid}");
            if (production == "-1")
            {
                return StatusCode(500);
            }
            JsonElement json = JsonDocument.Parse(production).RootElement;
            Response.Headers.Add("Cache-Control", "public, s-maxage=1000");
            return Ok(json);
        }
    }


    [Route("/api/post")]
    public class Test : ControllerBase
    {
        [HttpPost]
        public ActionResult<List<Production>> Post([FromBody] List<Production> t)
        {
            var l = new List<ExpandoObject>();
            foreach (var item in t)
            {
                dynamic res = new ExpandoObject();
                foreach (var type in item.types)
                {
                    if (type == 0)
                    {
                        string kgupString = Api.GetRequest($"https://seffaflik.epias.com.tr/transparency/service/production/dpp?organizationEIC={item.etso}&uevcbEIC={item.eic}&startDate={item.start}&endDate={item.end}");
                        JsonElement json = JsonDocument.Parse(kgupString).RootElement;
                        res.kgup = json.GetProperty("body");
                    }
                    else if (type == 1)
                    {
                        string eakString = Api.GetRequest($"https://seffaflik.epias.com.tr/transparency/service/production/aic?organizationEIC={item.etso}&uevcbEIC={item.eic}&startDate={item.start}&endDate={item.end}");
                        JsonElement json = JsonDocument.Parse(eakString).RootElement;
                        res.eak = json.GetProperty("body");
                    }
                    else if (type == 2)
                    {
                        string urgentString = Api.GetRequest($"https://seffaflik.epias.com.tr/transparency/service/production/urgent-market-message?startDate={item.start}&endDate={item.end}&regionId=1&uevcbId={item.id}");
                        JsonElement json = JsonDocument.Parse(urgentString).RootElement;
                        res.urgent = json.GetProperty("body");
                    }
                }
                res.name = item.name;
                l.Add(res);
            }
            Console.WriteLine(l);
            return Ok(l);
        }
    }
}



