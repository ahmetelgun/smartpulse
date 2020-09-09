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
using System.ComponentModel.DataAnnotations;
using System.Drawing;



namespace dotnet.Controllers
{
    [ApiController]
    [Route("/api/getorganizations")]
    public class GetOrganizations : ControllerBase
    {
        [HttpGet]
        public ActionResult<List<Organization>> Get()
        {
            var db = new SmartPulseContext();
            List<Organization> organizations = db.Organizations.OrderBy(x => x.organizationName).ToList();
            return Ok(organizations);
        }
    }

    [Route("/api/getcentrals")]
    public class GetCentrals : ControllerBase
    {
        [HttpGet]
        public ActionResult<List<CentralList>> Get(string etso)
        {
            var db = new SmartPulseContext();
            string[] etsos = etso.Split(",");
            List<CentralList> listOfCentrals = new List<CentralList>();
            foreach (var etsoCode in etsos)
            {
                Organization organization = db.Organizations.Where(x => x.organizationETSOCode == etsoCode).FirstOrDefault();
                if (organization != null) // If there is an existing organization with this etso code
                {
                    string centrals;
                    if (db.Centrals.Where(x => x.organization == organization).ToList().Count() == 0)
                    {
                        centrals = Api.GetRequest($"https://seffaflik.epias.com.tr/transparency/service/production/dpp-injection-unit-name?organizationEIC={etsoCode}");
                        if (centrals == "-1")
                        {
                            continue;
                        }
                        JsonElement units = JsonDocument.Parse(centrals).RootElement.GetProperty("body").GetProperty("injectionUnitNames");

                        foreach (var item in units.EnumerateArray())
                        {
                            Central temp = JsonSerializer.Deserialize<Central>(item.GetRawText());
                            temp.organization = organization;
                            db.Centrals.Add(temp);
                            db.SaveChanges();
                        }
                    }
                    List<Central> centralList = db.Centrals.Where(x => x.organization == organization).Select(s => new Central
                    {
                        id = s.id,
                        name = s.name,
                        eic = s.eic
                    }).ToList();
                    CentralList centralTemp = new CentralList
                    {
                        centrals = centralList,
                        name = organization.organizationName,
                        etso = organization.organizationETSOCode
                    };
                    listOfCentrals.Add(centralTemp);
                }
            }

            return Ok(listOfCentrals);

        }
    }

    [Route("/api/getproductiondata")]
    public class GetProductionData : ControllerBase
    {
        [HttpPost]
        public IActionResult Post([FromBody] List<Production> t)
        {
            List<Task> requestList = new List<Task>();
            List<ProductionData> productionDataList = new List<ProductionData>();
            Parallel.ForEach(t, item =>
           {
               ProductionData productionData = new ProductionData();
               Parallel.ForEach(item.types, type =>
             {
                 if (type == 0)
                 {
                     string kgupString = Api.GetRequest($"https://seffaflik.epias.com.tr/transparency/service/production/dpp?organizationEIC={item.etso}&uevcbEIC={item.eic}&startDate={item.start}&endDate={item.end}");
                     JsonElement json = JsonDocument.Parse(kgupString).RootElement;
                     productionData.kgup = json.GetProperty("body");
                 }
                 else if (type == 1)
                 {
                     string eakString = Api.GetRequest($"https://seffaflik.epias.com.tr/transparency/service/production/aic?organizationEIC={item.etso}&uevcbEIC={item.eic}&startDate={item.start}&endDate={item.end}");
                     JsonElement json = JsonDocument.Parse(eakString).RootElement;
                     productionData.eak = json.GetProperty("body");
                 }
                 else if (type == 2)
                 {
                     string urgentString = Api.GetRequest($"https://seffaflik.epias.com.tr/transparency/service/production/urgent-market-message?startDate={item.start}&endDate={item.end}&regionId=1&uevcbId={item.id}");
                     JsonElement json = JsonDocument.Parse(urgentString).RootElement;
                     productionData.urgent = json.GetProperty("body");
                 }
             });

               productionData.name = item.name;
               productionDataList.Add(productionData);

           });


            return Ok(productionDataList);
        }
    }

    [Route("/api/signup")]
    public class Signup : ControllerBase
    {
        [HttpPost]
        public IActionResult Post([FromBody] User user)
        {
            var db = new SmartPulseContext();
            if (user.email == null || user.email == "" || !new EmailAddressAttribute().IsValid(user.email))
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
            var u = db.Users.Where(u => u.email == user.email).FirstOrDefault();
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
            if (Request.Cookies["token"] != null && Request.Cookies["token"] != "")
            {
                var tempUser = db.Users.FirstOrDefault(u => u.token == Request.Cookies["token"]);
                var emailFromToken = auth.ValidateJwtToken(Request.Cookies["token"]);
                if (tempUser != null)
                {
                    if (tempUser.email == emailFromToken)
                    {
                        return Ok(new { message = "success", token = user.token });
                    }
                    Response.Cookies.Append("token", "");
                    tempUser.token = "";
                    db.SaveChanges();
                }
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
                    Response.Cookies.Append("token", token);
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
                Response.Cookies.Append("token", "");
                return Ok(new { message = "success" });
            }
            return Ok(new { message = "error" });
        }
    }

    [Route("/api/savewatchlist")]
    public class SaveWatchList : ControllerBase
    {
        [HttpPost]
        public IActionResult Post([FromBody] WatchList watchList)
        {
            var auth = new AuthenticationController();
            var db = new SmartPulseContext();
            string token = Request.Cookies["token"];
            var user = auth.isLogin(token);
            if (user != null)
            {
                var w = db.WatchLists.FirstOrDefault(w => w.name == watchList.name);
                if (w != null)
                {
                    w.json = watchList.json;
                    db.SaveChanges();
                    return Ok(new { message = "update success" });
                }
                watchList.user = user;
                db.WatchLists.Add(watchList);
                db.SaveChanges();
                return Ok(new { message = "success" });
            }
            return Unauthorized(new { message = "failed" });
        }
    }

    [Route("/api/getwatchlist")]
    public class GetWatchList : ControllerBase
    {
        [HttpGet]
        public IActionResult Get(string name)
        {
            var auth = new AuthenticationController();
            var db = new SmartPulseContext();
            var token = Request.Cookies["token"];
            var user = auth.isLogin(token);
            if (user != null)
            {
                if (name != null)
                {
                    var watchList = db.WatchLists.Where(w => w.user == user && w.name == name).FirstOrDefault();
                    if (watchList != null)
                    {
                        return Ok(new { name = watchList.name, json = watchList.json });
                    }
                }
                else
                {
                    var watchList = db.WatchLists.Where(w => w.user == user).ToList();
                    List<string> watchNames = new List<string>();
                    foreach (var item in watchList)
                    {
                        watchNames.Add(item.name);
                    }
                    return Ok(watchNames);
                }
                return NotFound(new { message = "name not found" });
            }

            return Unauthorized(new { message = "failed" });
        }

    }
}



