using System;
using System.Net;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using dotnet.API;
using System.Net.Http;
using Microsoft.AspNetCore.Http;
using System.Net.Mime;
using System.Threading;

namespace dotnet.Controllers
{
    [ApiController]
    [Route("/api/main")]
    //[Produces("application/json")]
    public class MainController : ControllerBase
    {
        [HttpGet]

        public IActionResult Get()
        {
            string organizations = Api.GetRequest("https://seffaflik.epias.com.tr/transparency/service/production/dpp-organization");
            if (organizations == "-1")
            {
                return StatusCode(500);
            }
            JsonElement json = JsonDocument.Parse(organizations).RootElement;
            Response.Headers.Add("Cache-Control", "public, s-maxage=1000");
            return Ok(json);
        }
    }

    [Route("/api/organization")]
    public class OrganizationController : ControllerBase
    {
        [HttpGet]
        public IActionResult Get(string etso)
        {
            string stations = Api.GetRequest($"https://seffaflik.epias.com.tr/transparency/service/production/dpp-injection-unit-name?organizationEIC={etso}");
            if (stations == "-1")
            {
                return StatusCode(500);
            }
            JsonElement json = JsonDocument.Parse(stations).RootElement;
            Response.Headers.Add("Cache-Control", "public, s-maxage=1000");
            return Ok(json);
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
}



