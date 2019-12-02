// <copyright file="HttpJsonUtilsEx.cs" company="Racing Australia">
// All rights reserved (C) Racing Australia 2018
// </copyright>

namespace ROR.Cloud.Data.Repo.Utils
{
    using System;
    using System.Net;
    using System.Net.Http;
    using System.Net.Http.Headers;
    using System.Threading.Tasks;
    using Microsoft.AspNetCore.Http;
    using Microsoft.Extensions.Options;
    using Newtonsoft.Json;
    using ROR.Cloud.Data.Common;
    using ROR.Shared.Models;

    /// <summary>
    /// HttpExtendedUtils
    /// </summary>
    public class HttpJsonUtilsEx
    {
        /// <summary>
        /// The accessor
        /// </summary>
        private readonly IHttpContextAccessor accessor;

        /// <summary>
        /// The application settings
        /// </summary>
        private readonly AppSettings appSettings;

        /// <summary>
        /// Initializes a new instance of the <see cref="HttpJsonUtilsEx" /> class.
        /// </summary>
        /// <param name="accessor">The accessor.</param>
        /// <param name="appSettings">The application settings.</param>
        public HttpJsonUtilsEx(IHttpContextAccessor accessor, IOptions<AppSettings> appSettings)
        {
            this.appSettings = appSettings.Value;
            this.accessor = accessor;
        }

        /// <summary>
        /// Gets the json data from URI. IF null returns the default for the data type
        /// Inherently will return NULL for non premitive types, Primitives are BLOCKED
        /// </summary>
        /// <typeparam name="T1">The type of the 1.</typeparam>
        /// <param name="url">The URL.</param>
        /// <param name="baseAddress">The base address.</param>
        /// <returns>
        /// Deserialize json object
        /// </returns>
        /// <exception cref="Exception">When request fails</exception>
        public async Task<T1> GetJsonDataFromUri<T1>(string url, string baseAddress = "")
        {
            try
            {
                if (!string.IsNullOrEmpty(this.appSettings.Proxy))
                {
                    using (HttpClientHandler handler = new HttpClientHandler() { Proxy = new WebProxy(this.appSettings.Proxy, true) })
                    {
                        return await this.ExecuteGet<T1>(url, baseAddress, handler);
                    }
                }
                else
                {
                    return await this.ExecuteGet<T1>(url, baseAddress);
                }
            }
            catch (HttpRequestException ex)
            {
                throw new Exception($"HTTP request failed : {ex.Message}\nURL : {baseAddress}{url}");
            }
        }

        /// <summary>
        /// Posts the specified model.
        /// </summary>
        /// <typeparam name="T2">The type of the 2.</typeparam>
        /// <param name="model">The model.</param>
        /// <param name="url">The URL.</param>
        /// <param name="baseAddress">The base address.</param>
        /// <returns>
        /// Task<typeparamref name="T2" />
        /// </returns>
        /// <exception cref="Exception">Throws exception</exception>
        public async Task<AjaxResponse<T2>> PostData<T2>(T2 model, string url, string baseAddress = "")
        {
            return await this.Post<T2, T2>(model, url, baseAddress);
        }

        /// <summary>
        /// Posts the data asymmetric.
        /// </summary>
        /// <typeparam name="T1">The type of the 1.</typeparam>
        /// <typeparam name="T2">The type of the 2.</typeparam>
        /// <param name="model">The model.</param>
        /// <param name="url">The URL.</param>
        /// <param name="baseAddress">The base address.</param>
        /// <returns>Post One model and bring back another</returns>
        public async Task<AjaxResponse<T1>> PostDataAsymmetric<T1, T2>(T2 model, string url, string baseAddress = "")
        {
            return await this.Post<T1, T2>(model, url, baseAddress);
        }

        /// <summary>
        /// Posts the specified model.
        /// </summary>
        /// <typeparam name="T3">The type of the 3.</typeparam>
        /// <param name="model">The model.</param>
        /// <param name="url">The URL.</param>
        /// <param name="baseAddress">The base address.</param>
        /// <returns>
        /// Task<typeparamref name="T3" />
        /// </returns>
        /// <exception cref="Exception">Throws exception</exception>
        public async Task<AjaxResponse<T3>> Put<T3>(T3 model, string url, string baseAddress = "")
        {
            try
            {
                if (!string.IsNullOrEmpty(this.appSettings.Proxy))
                {
                    using (HttpClientHandler handler = new HttpClientHandler() { Proxy = new WebProxy(this.appSettings.Proxy, true) })
                    {
                        return await this.ExecutePut(model, url, baseAddress, handler);
                    }
                }
                else
                {
                    return await this.ExecutePut(model, url, baseAddress);
                }
            }
            catch (HttpRequestException ex)
            {
                throw new Exception($"HTTP request failed : {ex.Message}\nURL : {baseAddress}{url}");
            }
        }

        /// <summary>
        /// Executes the put.
        /// </summary>
        /// <typeparam name="T1">The type of the 3.</typeparam>
        /// <param name="url">The URL.</param>
        /// <param name="baseAddress">The base address.</param>
        /// <param name="handler">The handler.</param>
        /// <returns>
        /// AjaxResponse template task
        /// </returns>
        private async Task<T1> ExecuteGet<T1>(string url, string baseAddress = "", HttpClientHandler handler = null)
        {
            using (HttpClient client = handler == null ? new HttpClient() : new HttpClient(handler))
            {
                client.SetSafeBaseAddress(url, baseAddress);

                this.PackPersonCodeHeaderIfExists(client);
                client.DefaultRequestHeaders.Accept.Clear();
                client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

                // HTTP GET
                DateTime start = DateTime.Now;
                HttpResponseMessage response = await client.GetAsync(
                    $"{url}").ConfigureAwait(false);
                DateTime finish = DateTime.Now;
                double diff = finish.Subtract(start).TotalMilliseconds;

                response.EnsureSuccessStatusCode();

                string dataStreamRead = await response.Content.ReadAsStringAsync();

                // TODO review can Default used here
                if (dataStreamRead == null)
                {
                    return default(T1);
                }

                // this will save us from a lot of grief - the CamelCasePropertyNamesContractResolver
                T1 res = JsonConvert.DeserializeObject<T1>(dataStreamRead);

                Type t1Type = typeof(T1).GetGenericTypeDefinition();

                if (t1Type != null && typeof(T1).Name.StartsWith("AjaxResponse") && typeof(T1).IsGenericType)
                {
                    Type genT = typeof(T1).GetGenericArguments()[0];
                    typeof(AjaxResponse<>).MakeGenericType(genT).GetMethod("SetTestTime").Invoke(res, new object[] { diff });
                }

                return res;
            }
        }

        /// <summary>
        /// Posts the assymetric.
        /// </summary>
        /// <typeparam name="T1">The type of the 1.</typeparam>
        /// <typeparam name="T2">The type of the 2.</typeparam>
        /// <param name="model">The model.</param>
        /// <param name="url">The URL.</param>
        /// <param name="baseAddress">The base address.</param>
        /// <returns>Posts and gets asymetric data model</returns>
        private async Task<AjaxResponse<T1>> Post<T1, T2>(T2 model, string url, string baseAddress = "")
        {
            try
            {
                if (!string.IsNullOrEmpty(this.appSettings.Proxy))
                {
                    using (HttpClientHandler handler = new HttpClientHandler() { Proxy = new WebProxy(this.appSettings.Proxy, true) })
                    {
                        return await this.ExecutePost<T1, T2>(model, url, baseAddress, handler);
                    }
                }
                else
                {
                    return await this.ExecutePost<T1, T2>(model, url, baseAddress);
                }
            }
            catch (HttpRequestException ex)
            {
                throw new Exception($"HTTP request failed : {ex.Message}\nURL : {baseAddress}{url}");
            }
        }

        /// <summary>
        /// Executes the post asymetric.
        /// </summary>
        /// <typeparam name="T1">The type of the 1.</typeparam>
        /// <typeparam name="T2">The type of the 2.</typeparam>
        /// <param name="model">The model.</param>
        /// <param name="url">The URL.</param>
        /// <param name="baseAddress">The base address.</param>
        /// <param name="handler">The handler.</param>
        /// <returns>AjaxResponse wrapped stuff</returns>
        private async Task<AjaxResponse<T1>> ExecutePost<T1, T2>(T2 model, string url, string baseAddress = "", HttpClientHandler handler = null)
        {
            using (HttpClient client = handler == null ? new HttpClient() : new HttpClient(handler))
            {
                client.SetSafeBaseAddress(url, baseAddress);

                this.PackPersonCodeHeaderIfExists(client);
                client.DefaultRequestHeaders.Accept.Clear();
                client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

                var myContent = JsonConvert.SerializeObject(model);
                var buffer = System.Text.Encoding.UTF8.GetBytes(myContent);
                var byteContent = new ByteArrayContent(buffer);
                byteContent.Headers.ContentType = new MediaTypeHeaderValue("application/json");

                // HTTP POST
                HttpResponseMessage response = await client.PostAsync(
                    $"{url}", byteContent).ConfigureAwait(false);
                response.EnsureSuccessStatusCode();

                string dataStreamRead = await response.Content.ReadAsStringAsync();

                // TODO review can Default used here
                if (dataStreamRead == null)
                {
                    return new AjaxResponse<T1>() { ResponseData = default(T1) };
                }

                return JsonConvert.DeserializeObject<AjaxResponse<T1>>(dataStreamRead);
            }
        }

        /// <summary>
        /// Executes the put.
        /// </summary>
        /// <typeparam name="T3">The type of the 3.</typeparam>
        /// <param name="model">The model.</param>
        /// <param name="url">The URL.</param>
        /// <param name="baseAddress">The base address.</param>
        /// <param name="handler">The handler.</param>
        /// <returns>AjaxResponse template task</returns>
        private async Task<AjaxResponse<T3>> ExecutePut<T3>(T3 model, string url, string baseAddress = "", HttpClientHandler handler = null)
        {
            using (HttpClient client = handler == null ? new HttpClient() : new HttpClient(handler))
            {
                client.SetSafeBaseAddress(url, baseAddress);

                this.PackPersonCodeHeaderIfExists(client);
                client.DefaultRequestHeaders.Accept.Clear();
                client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

                var myContent = JsonConvert.SerializeObject(model);
                var buffer = System.Text.Encoding.UTF8.GetBytes(myContent);
                var byteContent = new ByteArrayContent(buffer);
                byteContent.Headers.ContentType = new MediaTypeHeaderValue("application/json");

                // HTTP GET
                HttpResponseMessage response = await client.PutAsync(
                    $"{url}", byteContent).ConfigureAwait(false);
                response.EnsureSuccessStatusCode();

                string dataStreamRead = await response.Content.ReadAsStringAsync();

                // TODO review can Default used here
                if (dataStreamRead == null)
                {
                    return new AjaxResponse<T3>() { ResponseData = default(T3) };
                }

                return JsonConvert.DeserializeObject<AjaxResponse<T3>>(dataStreamRead);
            }
        }

        /// <summary>
        /// Packs the person code header if exists.
        /// </summary>
        /// <param name="client">The client.</param>
        private void PackPersonCodeHeaderIfExists(HttpClient client)
        {
            if (this.accessor.HttpContext != null &&
                this.accessor.HttpContext.User != null &&
                this.accessor.HttpContext.User.FindFirst("PersonCode") != null)
            {
                client.DefaultRequestHeaders.Add("PersonCode", this.accessor.HttpContext.User.FindFirst("PersonCode").Value);
            }
        }
    }
}
