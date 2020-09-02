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

namespace dotnet.API
{
    public class Api
    {
        public static string GetRequest(string url)
        {
            string response;
            try
            {
                HttpWebResponse webResponse;
                HttpWebRequest request = (HttpWebRequest)WebRequest.Create(url);
                request.Method = "GET";
                webResponse = (HttpWebResponse)request.GetResponse();
                var webStream = webResponse.GetResponseStream();
                var responseReader = new StreamReader(webStream);
                response = responseReader.ReadToEnd();
                responseReader.Close();
            }
            catch (WebException e)
            {
                Console.WriteLine(e);
                response = "-1";
            }
            return response;
        }
    }
}