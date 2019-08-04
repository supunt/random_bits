// <copyright file="Plc.cs" company="FooBar Australasia">
// Copyright (c) FooBar Australasia. All rights reserved.
// </copyright>

namespace FooBar.Plc
{
    using System;
    using System.Collections.Generic;
    using System.IO;
    using System.Net;
    using System.Text.RegularExpressions;
    using FooBar.Common;
    using FooBar.Common.EventArguments;
    using FooBar.Communications.Event;
    using FooBar.Communications.Tcp;
    using FooBar.Concurrent;
    using FooBar.Configurations;
    using FooBar.Logger;
    using FooBar.Logger.Layout;
    using FooBar.Plc.IOStructures;
    using FooBar.StateMachine;
    using static FooBar.Common.Enums;
    using static FooBar.Logger.Color;
    using static FooBar.Utilities.CompilerServices.FunctionInformation;
    using static System.FormattableString;

    /// <summary>
    /// State machine for PLC
    /// </summary>
    /// <seealso cref="FooBar.StateMachine.StateMachine{T}" />
    /// <seealso cref="IPlc" />
    public class Plc : StateMachine<PlcState>, IPlc
    {
        /// <summary>
        /// The delay
        /// </summary>
        private static int delay;

        /// <summary>
        /// The logger manager name
        /// </summary>
        private static string className = GetClassNameFromFilePath();

        /// <summary>
        /// The configuration manager
        /// </summary>
        private IConfigurationManager configurationManager;

        /// <summary>
        /// The ip address
        /// </summary>
        private IPAddress defaultIPAddress;

        /// <summary>
        /// The ip address
        /// </summary>
        private IPAddress ipAddress;

        /// <summary>
        /// The port
        /// </summary>
        private int port;

        /// <summary>
        /// The TCP client
        /// </summary>
        private ClientTCP tcpClient;

        /// <summary>
        /// The configuration manager
        /// </summary>
        private PLCSettings plcSettings;

        /// <summary>
        /// The logger
        /// </summary>
        private ILogger logger;

        /// <summary>
        /// The device logger
        /// </summary>
        private IDeviceLogger deviceLogger;

        /// <summary>
        /// The PLC tx fifo
        /// </summary>
        private IConcurrentBlockingFifo<byte[]> plcTxFifo;

        /// <summary>
        /// The PLC input event data
        /// </summary>
        private PlcInputEventData plcInputEventData;

        /// <summary>
        /// The PLC output event data
        /// </summary>
        private PlcOutputEventData plcOutputEventData;

        /// <summary>
        /// The PLC memory block event data
        /// </summary>
        private PlcSystemEventData plcSystemEventData;

        /// <summary>
        /// The missed heartbeats
        /// </summary>
        private int missedHeartbeats;

        /// <summary>
        /// The PLC data stream
        /// </summary>
        private string plcDataStream;

        /// <summary>
        /// The regex hash event system
        /// </summary>
        private Regex regexHashEventSystem;

        /// <summary>
        /// The regexfind parameters
        /// </summary>
        private Regex regexfindParams;

        /// <summary>
        /// The PLC data stream lock
        /// </summary>
        private object plcDataStreamLock;

        /// <summary>
        /// The is disposed
        /// </summary>
        private bool isDisposed;

        /// <summary>
        /// Initializes a new instance of the <see cref="Plc" /> class.
        /// </summary>
        /// <param name="name">The name.</param>
        /// <param name="deviceLogger">The device logger</param>
        /// <param name="configurationManager">The configuration manager.</param>
        public Plc(string name, IDeviceLogger deviceLogger, IConfigurationManager configurationManager)
            : base(deviceLogger)
        {
            this.Name = name;
            this.deviceLogger = deviceLogger ?? throw new ArgumentNullException("deviceLogger", "Device Logger cannot be null");
            this.logger = deviceLogger.CreateComponentLogger(className);
            this.StateMessage = "PLC is not enabled";
            this.State = GuiState.FAULT;

            bool success = IPAddress.TryParse("0.0.0.0", out this.ipAddress);

            this.isDisposed = false;
            this.port = 0;
            this.missedHeartbeats = 0;
            this.plcDataStream = string.Empty;
            this.plcDataStreamLock = new object();

            this.regexHashEventSystem = new Regex("##(\\w*) (\\w*)(.*)");
            this.regexfindParams = new Regex(" (([\\w]*)=((\"[a-zA-Z0-9._\\ ]*\")|(0x[0-9]*))|(\\w*))");

            delay = 0;
            this.configurationManager = configurationManager ?? throw new ArgumentNullException("configurationManager", "ConfigurationManager cannot be null");

            this.plcSettings = configurationManager.PLCSettings;
            configurationManager.PLCSettings.SettingsChanged += this.PLCSettings_SettingsChanged;
            success = IPAddress.TryParse("0.0.0.0", out this.defaultIPAddress);

            success = IPAddress.TryParse(this.plcSettings.IPAddress, out this.ipAddress);
            this.port = this.plcSettings.Port;

            this.plcTxFifo = new ConcurrentBlockingFifo<byte[]>();

            this.plcInputEventData = new PlcInputEventData();
            this.plcOutputEventData = new PlcOutputEventData();
            this.plcSystemEventData = new PlcSystemEventData();

            this.plcInputEventData.EventDataChanged += this.PlcInputEventData_EventDataChanged;
            this.plcOutputEventData.EventDataChanged += this.PlcOutputEventData_EventDataChanged;
            this.plcSystemEventData.EventDataChanged += this.PlcSystemEventData_EventDataChanged;
            this.plcSystemEventData.HeartbeatEvent += this.PlcSystemEventData_HeartbeatEvent;
        }

        /// <summary>
        /// The system event
        /// </summary>
        public event PlcSystemEventHandler PlcSystemInformationEvent;

        /// <summary>
        /// The system event
        /// </summary>
        public event PlcBinaryEventHandler DrawCloseEvent;

        /// <summary>
        /// The system event
        /// </summary>
        public event PlcBinaryEventHandler VisionSensorStrobeFlash;

        /// <summary>
        /// The system event
        /// </summary>
        public event PlcBinaryEventHandler VisionDrawClosedLamp;

        /// <summary>
        /// Gets the name.
        /// </summary>
        /// <value>
        /// The name.
        /// </value>
        protected string Name { get; }

        /// <summary>
        /// Enables the PLC.
        /// </summary>
        public void EnablePlc()
        {
            this.StartStateMachine(PlcState.State_GetPort, this.State_GetPort);
        }

        /// <summary>
        /// Emits the information.
        /// </summary>
        public void EmitInformation()
        {
            this.PlcSystemInformationEvent?.Invoke(
                this,
                new PlcSystemInfoEventArgs()
                {
                    Customer = this.plcSystemEventData.Customer,
                    Name = this.plcSystemEventData.Name,
                    Job = this.plcSystemEventData.Job,
                    Version = this.plcSystemEventData.Version
                });

            this.DrawCloseEvent?.Invoke(this, new PlcBinaryEventArgs() { Value = (this.plcInputEventData.Value & 0x1) > 0 });
            this.VisionSensorStrobeFlash?.Invoke(this, new PlcBinaryEventArgs() { Value = (this.plcOutputEventData.Value & 0x2) > 0 });
            this.VisionDrawClosedLamp?.Invoke(this, new PlcBinaryEventArgs() { Value = (this.plcOutputEventData.Value & 0x4) > 0 });
        }

        /// <summary>
        /// Releases unmanaged and - optionally - managed resources.
        /// </summary>
        /// <param name="disposing"><c>true</c> to release both managed and unmanaged resources; <c>false</c> to release only unmanaged resources.</param>
        protected override void Dispose(bool disposing)
        {
            base.Dispose(disposing);

            if (!this.isDisposed)
            {
                if (disposing)
                {
                    if (this.tcpClient != null)
                    {
                        this.tcpClient.Connected -= this.TcpClient_Connected;
                        this.tcpClient.Disconnected -= this.TcpClient_Disconnected;
                        this.tcpClient.DataAvailable -= this.TcpClient_DataAvailable;

                        // Poll timer is killed by now
                        if (this.tcpClient.IsConnected)
                        {
                            this.logger.Information(Invariant($"{Red}Disconnecting from PLC {this.Name}"));
                            this.tcpClient.Disconnect();
                        }
                    }

                    this.tcpClient?.Dispose();
                    this.tcpClient = null;
                    this.plcTxFifo = null;
                }

                this.isDisposed = true;
            }
        }

        /// <summary>
        /// PLCs the system event data event data changed.
        /// </summary>
        /// <param name="sender">The source of the event.</param>
        /// <param name="e">The <see cref="EventArgs"/> instance containing the event data.</param>
        private void PlcSystemEventData_EventDataChanged(object sender, EventArgs e)
        {
            this.logger.Debug(Invariant($"System event.  ") +
                Invariant($"Customer={this.plcSystemEventData.Customer}, ") +
                Invariant($"Name={this.plcSystemEventData.Name}, ") +
                Invariant($"Job={this.plcSystemEventData.Job}, Version={this.plcSystemEventData.Version}"));

            this.PlcSystemInformationEvent?.Invoke(
                this,
                new PlcSystemInfoEventArgs()
                {
                    Customer = this.plcSystemEventData.Customer,
                    Name = this.plcSystemEventData.Name,
                    Job = this.plcSystemEventData.Job,
                    Version = this.plcSystemEventData.Version
                });
        }

        /// <summary>
        /// PLCs the output event data event data changed.
        /// </summary>
        /// <param name="sender">The source of the event.</param>
        /// <param name="e">The <see cref="EventArgs"/> instance containing the event data.</param>
        private void PlcOutputEventData_EventDataChanged(object sender, EventArgs e)
        {
            this.logger.Debug(Invariant($"Output event. Value={this.plcOutputEventData.Value}, Value Event={this.plcOutputEventData.ValueEvent}"));
            this.VisionSensorStrobeFlash?.Invoke(this, new PlcBinaryEventArgs() { Value = (this.plcOutputEventData.Value & 0x2) > 0 });
            this.VisionDrawClosedLamp?.Invoke(this, new PlcBinaryEventArgs() { Value = (this.plcOutputEventData.Value & 0x6) > 0 });
        }

        /// <summary>
        /// PLCs the input event data event data changed.
        /// </summary>
        /// <param name="sender">The source of the event.</param>
        /// <param name="e">The <see cref="EventArgs"/> instance containing the event data.</param>
        private void PlcInputEventData_EventDataChanged(object sender, EventArgs e)
        {
            this.logger.Debug(Invariant($"Input event.  Value={this.plcInputEventData.Value}, Value Event={this.plcInputEventData.ValueEvent}"));
            this.DrawCloseEvent?.Invoke(this, new PlcBinaryEventArgs() { Value = (this.plcInputEventData.Value & 0x1) > 0 });
        }

        /// <summary>
        /// PLCs the system event data heartbeat event.
        /// </summary>
        /// <param name="sender">The source of the event.</param>
        /// <param name="e">The <see cref="EventArgs"/> instance containing the event data.</param>
        private void PlcSystemEventData_HeartbeatEvent(object sender, EventArgs e)
        {
            this.logger.Debug(Defaults.DEFAULT_PLC_HEARTBEAT);
            this.missedHeartbeats = 0;
        }

        /// <summary>
        /// PLCs the settings settings changed.
        /// </summary>
        /// <param name="sender">The source of the event.</param>
        /// <param name="e">The <see cref="SettingsChangedEventArgs"/> instance containing the event data.</param>
        private void PLCSettings_SettingsChanged(object sender, SettingsChangedEventArgs e)
        {
            if (this.ipAddress.ToString() != this.configurationManager.PLCSettings.IPAddress ||
                this.port != this.configurationManager.PLCSettings.Port)
            {
                this.plcSettings = this.configurationManager.PLCSettings;
                IPAddress.TryParse(this.plcSettings.IPAddress, out this.ipAddress);
                this.port = this.plcSettings.Port;
                this.OnEvent(State_Event.Disconnect);
            }
        }

        /// <summary>
        /// Handles the Disconnected event of the TcpClient control.
        /// </summary>
        /// <param name="sender">The source of the event.</param>
        /// <param name="e">The <see cref="ConnectionEventArgs"/> instance containing the event data.</param>
        private void TcpClient_Disconnected(object sender, ConnectionEventArgs e)
        {
            this.OnEvent(State_Event.Disconnect);
        }

        /// <summary>
        /// Handles the Connected event of the TcpClient control.
        /// </summary>
        /// <param name="sender">The source of the event.</param>
        /// <param name="e">The <see cref="ConnectionEventArgs"/> instance containing the event data.</param>
        private void TcpClient_Connected(object sender, ConnectionEventArgs e)
        {
            this.OnEvent(State_Event.Connected);
        }

        /// <summary>
        /// Handles the DataAvailable event of the TcpClient control.
        /// </summary>
        /// <param name="sender">The source of the event.</param>
        /// <param name="e">The <see cref="DataEventArgs"/> instance containing the event data.</param>
        private void TcpClient_DataAvailable(object sender, DataEventArgs e)
        {
            if (e.Data == null)
            {
                return;
            }

            this.missedHeartbeats = 0;

            this.SetPlcData(System.Text.Encoding.Default.GetString(e.Data));

            Log log = this.logger.Log(Levels.Debug, Properties.Resources.PLC_DATA);
            log.AddLayout(new LayoutNameValue("Data", System.Text.Encoding.Default.GetString(e.Data)));
            log.Commit();

            this.OnEvent(State_Event.NewData);
        }

        /// <summary>
        /// States the get port.
        /// </summary>
        /// <param name="event">The event.</param>
        private void State_GetPort(State_Event @event)
        {
            switch (@event)
            {
                case State_Event.Enter:
                    this.UpdateStatus(GuiState.CONNECTING, Properties.Resources.GET_PLC_PORT_INFO);
                    break;
                case State_Event.Poll:
                    if (this.ipAddress != this.defaultIPAddress)
                    {
                        this.StateTrans(PlcState.State_Connect, this.State_Connect);
                    }
                    else
                    {
                        this.StateTrans(PlcState.State_WaitForPortInformation, this.State_WaitForPortInformation);
                    }

                    break;
                default:
                    break;
            }
        }

        /// <summary>
        /// States the wait for port information.
        /// </summary>
        /// <param name="event">The event.</param>
        private void State_WaitForPortInformation(State_Event @event)
        {
            switch (@event)
            {
                case State_Event.Enter:
                    delay = 0;
                    this.UpdateStatus(GuiState.FAULT, "Communications port for the plc is not configured.  Please setup the Plc");
                    break;
                case State_Event.Poll:
                    delay++;
                    if (delay > 5)
                    {
                        this.StateTrans(PlcState.State_GetPort, this.State_GetPort);
                    }

                    break;
                default:
                    break;
            }
        }

        /// <summary>
        /// States the connect.
        /// </summary>
        /// <param name="event">The event.</param>
        private void State_Connect(State_Event @event)
        {
            switch (@event)
            {
                case State_Event.Enter:
                    delay = 0;
                    this.UpdateStatus(GuiState.CONNECTING, "Attempting to connect to the plc.");
                    this.tcpClient = new ClientTCP("PlcTcpClient", this.deviceLogger, this.ipAddress, this.port, this.plcTxFifo);
                    this.tcpClient.Connected += this.TcpClient_Connected;
                    this.tcpClient.Disconnected += this.TcpClient_Disconnected;
                    this.tcpClient.DataAvailable += this.TcpClient_DataAvailable;
                    this.tcpClient.Connect();
                    break;
                case State_Event.Poll:
                    delay++;

                    if (delay > 5)
                    {
                        this.StateTrans(PlcState.State_Fault, this.State_Fault);
                    }

                    break;
                case State_Event.Connected:
                    this.StateTrans(PlcState.State_Online, this.State_Online);
                    break;
                case State_Event.Disconnect:
                    this.StateTrans(PlcState.State_Fault, this.State_Fault);
                    break;
                default:
                    break;
            }
        }

        /// <summary>
        /// States the online.
        /// </summary>
        /// <param name="event">The event.</param>
        private void State_Online(State_Event @event)
        {
            switch (@event)
            {
                case State_Event.Enter:
                    this.UpdateStatus(GuiState.ONLINE, "Connected to PLC");
                    this.plcInputEventData.MarkDirty();
                    this.plcOutputEventData.MarkDirty();
                    this.plcSystemEventData.MarkDirty();

                    this.SetSubscriptions();
                    break;
                case State_Event.NewData:
                    this.ProcessInputData();
                    break;
                case State_Event.Poll:
                    this.missedHeartbeats++;

                    if (this.missedHeartbeats > 10)
                    {
                        this.StateTrans(PlcState.State_Fault, this.State_Fault);
                    }

                    break;
                case State_Event.Disconnect:
                    this.StateTrans(PlcState.State_Fault, this.State_Fault);
                    break;
                default:
                    break;
            }
        }

        /// <summary>
        /// States the fault.
        /// </summary>
        /// <param name="event">The event.</param>
        private void State_Fault(State_Event @event)
        {
            switch (@event)
            {
                case State_Event.Enter:
                    delay = 0;
                    this.SetPlcData(string.Empty);
                    if (this.tcpClient != null)
                    {
                        this.tcpClient.Connected -= this.TcpClient_Connected;
                        this.tcpClient.Disconnected -= this.TcpClient_Disconnected;
                        this.tcpClient.DataAvailable -= this.TcpClient_DataAvailable;
                    }

                    this.tcpClient?.Disconnect();
                    this.tcpClient?.Dispose();
                    this.tcpClient = null;
                    this.UpdateStatus(GuiState.FAULT, Invariant($"{this.Name} is in fault."));
                    break;
                case State_Event.Poll:
                    delay++;

                    if (delay > 10)
                    {
                        this.StateTrans(PlcState.State_GetPort, this.State_GetPort);
                    }

                    break;
                default:
                    break;
            }
        }

        /// <summary>
        /// Sets the subscriptions.
        /// </summary>
        private void SetSubscriptions()
        {
            if (this.tcpClient.IsConnected)
            {
                this.logger.Information(Defaults.DEFAULT_SETTING_PLC_IO_SUBSCRIPTIONS);

                this.plcTxFifo.TryPush(this.plcInputEventData.GetSubscriptionString(), 100);
                this.plcTxFifo.TryPush(this.plcOutputEventData.GetSubscriptionString(), 100);
            }
        }

        private void ProcessInputData()
        {
            using (StringReader reader = new StringReader(this.GetPlcData()))
            {
                string line = string.Empty;
                do
                {
                    line = reader.ReadLine();

                    if (string.IsNullOrEmpty(line))
                    {
                        return;
                    }

                    Match searchMatch;
                    MatchCollection searchParmas;

                    Dictionary<string, string> plcInputParams = new Dictionary<string, string>();

                    searchMatch = this.regexHashEventSystem.Match(line);

                    if (searchMatch.Success)
                    {
                        searchParmas = this.regexfindParams.Matches(searchMatch.Groups[3].Value);

                        foreach (Match paramMatch in searchParmas)
                        {
                            string paramName = paramMatch.Groups[2].Value;
                            if (string.IsNullOrEmpty(paramName))
                            {
                                paramName = paramMatch.Groups[6].Value;
                            }

                            string paramValue = paramMatch.Groups[3].Value;

                            if (paramValue.Length > 0)
                            {
                                paramValue = paramValue.Trim();
                            }

                            plcInputParams.Add(paramName, paramValue);

                            switch (searchMatch.Groups[2].Value)
                            {
                                case PLCDefaults.PLC_System:
                                    this.plcSystemEventData.Unpack(plcInputParams);
                                    break;
                                case PLCDefaults.PLC_Inputs:
                                    this.plcInputEventData.Unpack(plcInputParams);
                                    break;
                                case PLCDefaults.PLC_Outputs:
                                    this.plcOutputEventData.Unpack(plcInputParams);
                                    break;
                                default:
                                    this.logger.Fault(Invariant($"Unknown System[' {searchMatch.Groups[2].Value} '] {line}"));
                                    break;
                            }
                        }
                    }
                }
                while (!string.IsNullOrEmpty(line));
            }

            this.SetPlcData(string.Empty);
        }

        /// <summary>
        /// Sets the PLC data.
        /// </summary>
        /// <param name="data">The data.</param>
        private void SetPlcData(string data)
        {
            lock (this.plcDataStreamLock)
            {
                this.plcDataStream = data;
            }
        }

        /// <summary>
        /// Sets the PLC data.
        /// </summary>
        /// <returns>a copy of this.plcDataStream</returns>
        private string GetPlcData()
        {
            string ret = string.Empty;
            lock (this.plcDataStreamLock)
            {
                ret = this.plcDataStream;
            }

            return ret;
        }
    }
}
