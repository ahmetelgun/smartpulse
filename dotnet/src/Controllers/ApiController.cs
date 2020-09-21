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
using System.Diagnostics;



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
        public ActionResult<List<OrganizationShortDefine>> Get(string etso)
        {
            var db = new SmartPulseContext();
            string[] etsos = etso.Split(",");
            List<OrganizationShortDefine> listOfCentrals = new List<OrganizationShortDefine>();
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
                    OrganizationShortDefine centralTemp = new OrganizationShortDefine
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
        public IActionResult Post([FromBody] ProductionRequest t)
        {
            List<OrganizationProductions> organizationProductionsList = new List<OrganizationProductions>();


            Parallel.ForEach(t.organizations, organization =>
            {
                OrganizationProductions organizationProductions = new OrganizationProductions();
                List<CentralProductions> centralProductionsList = new List<CentralProductions>();
                Parallel.ForEach(organization.centrals, central =>
                {
                    CentralProductions centralProductions = new CentralProductions();
                    Parallel.ForEach(t.types, type =>
                    {
                        if (type == 0)
                        {
                            string kgupString = Api.GetRequest($"https://seffaflik.epias.com.tr/transparency/service/production/dpp?organizationEIC={organization.etso}&uevcbEIC={central.eic}&startDate={t.start}&endDate={t.end}");
                            JsonElement json = JsonDocument.Parse(kgupString).RootElement;
                            var kgoek = new KgupOrEak();
                            foreach (var hour in json.GetProperty("body").GetProperty("dppList").EnumerateArray())
                            {
                                var field = new KgupOrEakField
                                {
                                    date = hour.GetProperty("tarih").GetString(),
                                    sum = hour.GetProperty("toplam").GetDouble()
                                };
                                kgoek.hourly.Add(field);
                            }
                            kgoek.hourly = kgoek.hourly.OrderBy(o => o.date).ToList();
                            foreach (var day in json.GetProperty("body").GetProperty("statistics").EnumerateArray())
                            {
                                var field = new KgupOrEakField
                                {
                                    date = day.GetProperty("tarih").GetString(),
                                    sum = day.GetProperty("toplamSum").GetDouble()
                                };
                                kgoek.daily.Add(field);
                            }
                            kgoek.daily = kgoek.daily.OrderBy(o => o.date).ToList();
                            centralProductions.types.kgup = kgoek;
                        }
                        else if (type == 1)
                        {
                            string eakString = Api.GetRequest($"https://seffaflik.epias.com.tr/transparency/service/production/aic?organizationEIC={organization.etso}&uevcbEIC={central.eic}&startDate={t.start}&endDate={t.end}");
                            JsonElement json = JsonDocument.Parse(eakString).RootElement;
                            var kgoek = new KgupOrEak();
                            foreach (var hour in json.GetProperty("body").GetProperty("aicList").EnumerateArray())
                            {
                                var field = new KgupOrEakField
                                {
                                    date = hour.GetProperty("tarih").GetString(),
                                    sum = hour.GetProperty("toplam").GetDouble()
                                };
                                kgoek.hourly.Add(field);
                            }
                            kgoek.hourly = kgoek.hourly.OrderBy(o => o.date).ToList();
                            foreach (var day in json.GetProperty("body").GetProperty("statistics").EnumerateArray())
                            {
                                var field = new KgupOrEakField
                                {
                                    date = day.GetProperty("tarih").GetString(),
                                    sum = day.GetProperty("toplamSum").GetDouble()
                                };
                                kgoek.daily.Add(field);
                            }
                            kgoek.daily = kgoek.daily.OrderBy(o => o.date).ToList();
                            centralProductions.types.eak = kgoek;
                        }
                        else if (type == 2)
                        {
                            string urgentString = Api.GetRequest($"https://seffaflik.epias.com.tr/transparency/service/production/urgent-market-message?startDate={t.start}&endDate={t.end}&regionId=1&uevcbId={central.id}");
                            JsonElement json = JsonDocument.Parse(urgentString).RootElement;
                            List<Urgent> urgents = new List<Urgent>();
                            foreach (var u in json.GetProperty("body").GetProperty("urgentMarketMessageList").EnumerateArray())
                            {
                                var urgent = new Urgent
                                {
                                    urgentStartDate = u.GetProperty("caseStartDate").GetString(),
                                    hourly = new List<UrgentField>()
                                };
                                foreach (var h in u.GetProperty("faultDetails").EnumerateArray())
                                {
                                    var urgentField = new UrgentField
                                    {
                                        date = h.GetProperty("date").GetString(),
                                        powerLoss = h.GetProperty("faultCausedPowerLoss").GetDouble()
                                    };
                                    urgent.hourly.Add(urgentField);
                                }
                                urgent.hourly = urgent.hourly.OrderBy(o => o.date).ToList();

                                urgent.type = u.GetProperty("messageType").GetInt32();
                                urgent.reason = u.GetProperty("reason").GetString();
                                urgents.Add(urgent);
                            }
                            centralProductions.types.urgent = urgents;
                        }
                    });
                    centralProductions.name = central.name;
                    centralProductions.id = central.id;
                    centralProductions.eic = central.eic;
                    centralProductionsList.Add(centralProductions);
                });
                organizationProductions.name = organization.name;
                organizationProductions.etso = organization.etso;
                organizationProductions.centralProductions = centralProductionsList;
                organizationProductionsList.Add(organizationProductions);
            });
            return Ok(organizationProductionsList);






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
            Thread.Sleep(3000);
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
                var thisUser = db.Users.FirstOrDefault(u => u.email == user.email);
                watchList.user = thisUser;
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


    [Route("/api/removewatchlist")]
    public class DeleteWatchList : ControllerBase
    {
        [HttpGet]
        public IActionResult Post(string name)
        {
            var auth = new AuthenticationController();
            var db = new SmartPulseContext();
            var token = Request.Cookies["token"];
            var user = auth.isLogin(token);
            if (user != null)
            {
                if (name != null)
                {
                    var watch = db.WatchLists.FirstOrDefault(w => w.name == name && w.user.email == user.email);
                    if (watch != null)
                    {
                        db.Remove(watch);
                        db.SaveChanges();
                        return Ok(new { message = "success" });
                    }
                }
            }
            return BadRequest("qwe");

        }
    }

    [Route("/api/savesheet")]
    public class ImportSheet : ControllerBase
    {
        [HttpPost]
        public IActionResult Post([FromBody] SavedGrid grid)
        {
            var auth = new AuthenticationController();
            var db = new SmartPulseContext();
            var token = Request.Cookies["token"];
            var user = auth.isLogin(token);
            if (user != null)
            {
                var exist = db.SavedGrids.FirstOrDefault(g => g.name == grid.name && g.user.email == user.email);
                if (exist != null)
                {
                    exist.header = grid.header;
                    exist.rows = grid.rows;
                    db.SaveChanges();
                    return Ok(new { message = "success" });
                }
                var thisUser = db.Users.FirstOrDefault(u => u.email == user.email);
                grid.user = thisUser;
                db.SavedGrids.Add(grid);
                db.SaveChanges();
                return Ok(new { message = "success" });
            }
            return Unauthorized(new { message = "unauthorized" });
        }
    }



    [Route("/api/getsheet")]
    public class GetSheet : ControllerBase
    {
        [HttpGet]
        public IActionResult Post(string name)
        {
            var auth = new AuthenticationController();
            var db = new SmartPulseContext();
            var token = Request.Cookies["token"];
            var user = auth.isLogin(token);
            if (user != null)
            {
                var grid = db.SavedGrids.FirstOrDefault(g => g.name == name && g.user.email == user.email);
                if (grid != null)
                {
                    return Ok(grid);
                }
                else
                {
                    return NotFound(new { message = "not found" });
                }
            }
            return Unauthorized(new { message = "unauthorized" });
        }
    }


    [Route("/api/getsheetlist")]
    public class GetSheetList : ControllerBase
    {
        [HttpGet]
        public IActionResult Post()
        {
            var auth = new AuthenticationController();
            var db = new SmartPulseContext();
            var token = Request.Cookies["token"];
            var user = auth.isLogin(token);
            if (user != null)
            {
                var grids = db.SavedGrids.Where(g => g.user.email == user.email).Select(s => new
                {
                    name = s.name
                }).ToList();
                return Ok(grids);
            }
            return Unauthorized(new { message = "unauthorized" });
        }
    }

}