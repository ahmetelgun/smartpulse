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
using System.Security.Cryptography;
using Microsoft.AspNetCore.Cryptography.KeyDerivation;
using System.Security.Claims;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.Extensions.Configuration;
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
            string[] etsos = etso.Split(",");
            dynamic organizations = new List<ExpandoObject>();
            foreach (var etsoCode in etsos)
            {
                var organization = db.Organizations.Where(x => x.organizationETSOCode == etsoCode).FirstOrDefault();
                if (organization != null)
                {
                    if (db.Stations.Where(x => x.organization == organization).ToList().Count() == 0)
                    {
                        string stations = Api.GetRequest($"https://seffaflik.epias.com.tr/transparency/service/production/dpp-injection-unit-name?organizationEIC={etsoCode}");
                        if (stations == "-1")
                        {
                            continue;
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
                    dynamic stationTemp = new ExpandoObject();
                    stationTemp.stations = stationList;
                    stationTemp.name = organization.organizationName;
                    stationTemp.etso = organization.organizationETSOCode;
                    organizations.Add(stationTemp);
                }
            }
            return Ok(organizations);
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
            return Ok(l);
        }
    }

    [Route("/api/signup")]
    public class Signup : ControllerBase
    {
        [HttpPost]
        public IActionResult Post([FromBody] User user)
        {
            var db = new SmartPulseContext();
            var u = db.Users.Where(u => u.email == user.email).FirstOrDefault();
            if (user.email == null || user.email == "")
            {
                return BadRequest(new { message = "email is invalid" });
            }
            if (user.name == null || user.name == "" || user.name.Length < 2)
            {
                return BadRequest(new { message = "name is invalid" });
            }
            if (user.surname == null || user.surname == "" || user.surname.Length < 2)
            {
                return BadRequest(new { message = "surname is invalid" });
            }
            if (user.password == null || user.password == "" || user.password.Length < 8)
            {
                return BadRequest(new { message = "password is invalid" });
            }
            if (u == null)
            {
                RNGCryptoServiceProvider rng = new RNGCryptoServiceProvider();
                byte[] buffer = new byte[512];

                rng.GetBytes(buffer);
                string salt = BitConverter.ToString(buffer);
                var auth = new AuthenticationController();
                var hashed = auth.CreatePassword(user.password, salt);
                user.password = hashed;
                user.salt = salt;
                db.Users.Add(user);
                db.SaveChanges();
                return Ok(new { message = "success" });
            }
            else
            {
                return Ok(new { message = "email is exist" });
            }
        }
    }

    [Route("/api/signin")]
    public class SignIn : ControllerBase
    {
        [HttpPost]
        public IActionResult Post([FromBody] User user)
        {
            var db = new SmartPulseContext();
            var auth = new AuthenticationController();
            if (user.token != null && user.token != "")
            {
                var tempUser = db.Users.FirstOrDefault(u => u.token == user.token);
                var isLogin = auth.ValidateJwtToken(user.token);
                if (tempUser != null)
                {
                    if (tempUser.email == isLogin)
                    {
                        return Ok(new { message = "success", token = user.token });
                    }
                    tempUser.token = "";
                    db.SaveChanges();
                }
                return Unauthorized(new { message = "token  denied" });
            }
            var temp = db.Users.Where(u => u.email == user.email).FirstOrDefault();
            if (temp != null)
            {
                var isLogin = auth.ValidatePassword(user.password, temp.password, temp.salt);
                if (isLogin)
                {
                    var token = auth.GenerateJwtToken(temp.email);
                    temp.token = token;
                    db.SaveChanges();
                    return Ok(new { message = "success", token = token });
                }
            }
            return Unauthorized(new { message = "email or password incorrect" });
        }
    }

    [Route("/api/logout")]
    public class Logout : ControllerBase
    {
        [HttpPost]
        public IActionResult Post([FromBody] User user)
        {
            var db = new SmartPulseContext();
            var temp = db.Users.Where(u => u.token == user.token).FirstOrDefault();
            if (temp != null)
            {
                temp.token = "";
                db.SaveChanges();
                return Ok(new { message = "success" });
            }
            return Ok(new { message = "error" });
        }
    }
}



