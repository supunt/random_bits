// <copyright file="DatabaseServer.cs" company="FooBar Australasia">
// Copyright (c) FooBar Australasia. All rights reserved.
// </copyright>

namespace FooBar.Database
{
    using System;
    using System.ComponentModel;
    using System.Data.SqlClient;
    using System.Threading;
    using FooBar.Common;
    using FooBar.Common.EventArguments;
    using FooBar.Configurations;
    using FooBar.Logger;
    using FooBar.Logger.Layout;
    using FooBar.StateMachine;
    using Utils;
    using static FooBar.Common.Enums;
    using static FooBar.Logger.Color;
    using static FooBar.Utilities.CompilerServices.FunctionInformation;
    using static System.FormattableString;

    /// <summary>
    /// DatabaseServer
    /// </summary>
    /// <seealso cref="FooBar.StateMachine.StateMachine{T}" />
    public class DatabaseServer : StateMachine<DatabaseState>, IDatabaseServer
    {
        /// <summary>
        /// The logger manager name
        /// </summary>
        private static string schemaName = "dbo";

        /// <summary>
        /// The logger manager name
        /// </summary>
        private static string className = GetClassNameFromFilePath();

        /// <summary>
        /// The database connection
        /// </summary>
        private IDatabaseConnection dbConn;

        /// <summary>
        /// The logger
        /// </summary>
        private ILogger logger;

        /// <summary>
        /// The logger
        /// </summary>
        private IDeviceLogger deviceLogger;

        /// <summary>
        /// The locations table
        /// </summary>
        private LocationTable.LocationTable locationsTable;

        /// <summary>
        /// The message table
        /// </summary>
        private MessageTable.MessageTable messageTable;

        /// <summary>
        /// The transform table
        /// </summary>
        private TransformTable.TransformTable transformTable;

        /// <summary>
        /// The inspection table
        /// </summary>
        private InspectionTable.InspectionTable inspectionTable;

        /// <summary>
        /// The result table
        /// </summary>
        private ResultTable.ResultTable resultTable;

        /// <summary>
        /// The connection string
        /// </summary>
        private string connectionString;

        /// <summary>
        /// The old donnection string
        /// </summary>
        private string oldConnectionString;

        /// <summary>
        /// The database configuration
        /// </summary>
        private DatabaseSettings dbConfig;

        /// <summary>
        /// The delay
        /// </summary>
        private int delay = 0;

        /// <summary>
        /// The maximum delay
        /// </summary>
        private int maxDelay = 60;

        /// <summary>
        /// The string utils
        /// </summary>
        private StringUtils stringUtils;

        /// <summary>
        /// The connection strings changed
        /// </summary>
        private object settingsLock;

        /// <summary>
        /// The is disposed
        /// </summary>
        private bool isDisposed;

        /// <summary>
        /// The command timeout
        /// </summary>
        private int commandTimeout;

        /// <summary>
        /// The ping timeout
        /// </summary>
        private int pingTimeout;

        /// <summary>
        /// The termination requested event
        /// </summary>
        private ManualResetEvent terminationRequestedEvent;

        /// <summary>
        /// The runner thread
        /// </summary>
        private Thread runnerThread;

        /// <summary>
        /// The database con lock object
        /// </summary>
        private object dbConLockObj;

        /// <summary>
        /// Initializes a new instance of the <see cref="DatabaseServer" /> class.
        /// </summary>
        /// <param name="deviceLogger">The logger MGR.</param>
        /// <param name="dbConfig">The database configuration.</param>
        /// <param name="timerSync">The timer synchronize.</param>
        public DatabaseServer(IDeviceLogger deviceLogger, DatabaseSettings dbConfig, ISynchronizeInvoke timerSync)
            : base(deviceLogger)
        {
            this.dbConfig = dbConfig;
            this.stringUtils = new StringUtils();
            this.isDisposed = false;

            this.State = GuiState.FAULT;
            this.StateMessage = "Not Connected.";
            this.deviceLogger = deviceLogger;
            this.logger = deviceLogger.CreateComponentLogger(className);
            this.dbConn = null;
            this.settingsLock = new object();
            this.connectionString = string.Empty;
            this.oldConnectionString = string.Empty;

            // Create tables ----------------------------------------------------------------
            this.locationsTable = new LocationTable.LocationTable(this, this.deviceLogger);
            this.messageTable = new MessageTable.MessageTable(this, this.deviceLogger);
            this.transformTable = new TransformTable.TransformTable(this, this.deviceLogger);
            this.inspectionTable = new InspectionTable.InspectionTable(this, this.deviceLogger);
            this.resultTable = new ResultTable.ResultTable(this, this.deviceLogger);

            // Route Table TWEs when you need to update banner
            this.locationsTable.TweCallback += this.Table_tweCallback;
            this.messageTable.TweCallback += this.Table_tweCallback;
            this.transformTable.TweCallback += this.Table_tweCallback;
            this.inspectionTable.TweCallback += this.Table_tweCallback;
            this.resultTable.TweCallback += this.Table_tweCallback;

            this.pingTimeout = 3;
            this.commandTimeout = 5;

            this.LoadDatabaseSettings();

            this.dbConfig.SettingsChanged += this.DbConfig_SettingsChanged;
            this.terminationRequestedEvent = new ManualResetEvent(false);
            this.dbConLockObj = new object();

            this.runnerThread = new Thread(new ThreadStart(this.StartDatabaseServer));
            this.runnerThread.Start();

            // this.StartStateMachine(DatabaseState.State_Connect, this.State_Connect, true, timerSync);
        }

        /// <summary>
        /// Gets gets or sets the name of the schema.
        /// </summary>
        /// <value>
        /// The name of the schema.
        /// </value>
        public static string SchemaName { get => schemaName; }

        /// <summary>
        /// Gets the transform table.
        /// </summary>
        /// <value>
        /// The transform table.
        /// </value>
        public TransformTable.TransformTable Transforms { get => this.transformTable; }

        /// <summary>
        /// Gets the Messages table.
        /// </summary>
        /// <value>
        /// The transform table.
        /// </value>
        public MessageTable.MessageTable Messages { get => this.messageTable; }

        /// <summary>
        /// Gets the Locations table.
        /// </summary>
        /// <value>
        /// The transform table.
        /// </value>
        public LocationTable.LocationTable Locations { get => this.locationsTable; }

        /// <summary>
        /// Gets the Inspections table.
        /// </summary>
        /// <value>
        /// The transform table.
        /// </value>
        public InspectionTable.InspectionTable Inspections { get => this.inspectionTable; }

        /// <summary>
        /// Gets the results.
        /// </summary>
        /// <value>
        /// The results.
        /// </value>
        public ResultTable.ResultTable Results { get => this.resultTable; }

        /// <summary>
        /// Gets the status.
        /// </summary>
        /// <value>
        /// The status.
        /// </value>
        public GuiState Status => this.State;

        /// <summary>
        /// Gets or sets gets the connection string.
        /// </summary>
        /// <value>
        /// The connection string.
        /// </value>
        public string ConnectionString
        {
            get => this.connectionString;
            set => this.connectionString = value;
        }

        /// <summary>
        /// Gets the database connection.
        /// </summary>
        /// <value>
        /// The database connection.
        /// </value>
        public IDatabaseConnection DbCon { get => this.dbConn; }

        /// <inheritdoc/>
        public int CommandTimeout
        {
            get
            {
                int retVal = 5;
                lock (this.settingsLock)
                {
                    retVal = this.commandTimeout;
                }

                return retVal;
            }

            set
            {
                lock (this.settingsLock)
                {
                    this.commandTimeout = value;
                }
            }
        }

        /// <inheritdoc/>
        public int PingTimeout
        {
            get
            {
                int retVal = 5;
                lock (this.settingsLock)
                {
                    retVal = this.pingTimeout;
                }

                return retVal;
            }

            set
            {
                lock (this.settingsLock)
                {
                    this.pingTimeout = value;
                }
            }
        }

        /// <summary>
        /// Acquires the database con lock.
        /// </summary>
        /// <returns>bool</returns>
        public bool AcquireDBConLock()
        {
            return Monitor.TryEnter(this.dbConLockObj, 1000);
        }

        /// <summary>
        /// Acquires the database con lock.
        /// </summary>
        /// <returns>bool</returns>
        public bool AcquireDBConLockShort()
        {
            return Monitor.TryEnter(this.dbConLockObj, 100);
        }

        /// <summary>
        /// Releases the database con lock.
        /// </summary>
        public void ReleaseDBConLock()
        {
            Monitor.Exit(this.dbConLockObj);
        }

        /// <summary>
        /// Faults the specified format.
        /// </summary>
        /// <param name="format">The format.</param>
        /// <param name="args">The arguments.</param>
        public void Fault(string format, params object[] args)
        {
            this.UpdateStatus(GuiState.FAULT, format, args);
        }

        /// <summary>
        /// News the inspection data. Cones from the FrmInspections, Same thread as FE.
        /// </summary>
        public void StopDatabaseServer()
        {
            this.logger?.Information(Invariant($"Stopping Database server"));
            this.OnEvent(State_Event.Fault);
            this.terminationRequestedEvent.Set();
            this.runnerThread?.Join();
            this.runnerThread = null;
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
                    this.stringUtils?.Dispose();
                    this.stringUtils = null;
                    this.dbConn?.Dispose();
                    this.dbConn = null;
                }

                this.isDisposed = true;
            }
        }

        /// <summary>
        /// Initializes this instance.
        /// </summary>
        private void StartDatabaseServer()
        {
            this.StartStateMachine(DatabaseState.State_Connect, this.State_Connect);
            this.terminationRequestedEvent.WaitOne();
        }

        /// <summary>
        /// Databases the configuration settings changed.
        /// </summary>
        /// <param name="sender">The source of the event.</param>
        /// <param name="e">The <see cref="SettingsChangedEventArgs"/> instance containing the event data.</param>
        private void DbConfig_SettingsChanged(object sender, SettingsChangedEventArgs e)
        {
            this.LoadDatabaseSettings();
        }

        /// <summary>
        /// Databases the connect thread entry method.
        /// </summary>
        /// <returns>If connection attempt failed or succeeded</returns>
        private bool ConnectToDatabase()
        {
            string connectionString = string.Empty;
            int timeout = 5;

            lock (this.settingsLock)
            {
                connectionString = this.connectionString;
                timeout = this.commandTimeout;
            }

            if (string.IsNullOrEmpty(this.connectionString))
            {
                this.Fault("Database is not configured.  Please setup the database connection.");
                return false;
            }

            // Add a timeout so that it bails
            connectionString += Defaults.DEFAULT_DB_CONN_TIMEOUTSTRING + timeout.ToString();
            try
            {
                if (!this.AcquireDBConLock())
                {
                    return false;
                }
                else
                {
                    this.dbConn = new SqlDatabaseConnection(this.deviceLogger, connectionString);
                    this.dbConn.Connect();

                    if (!DatabaseUtils.CheckIfRequiredSchemaExists((SqlConnection)this.dbConn.GetConnection(), this.logger, this.CommandTimeout))
                    {
                        this.ReleaseDBConLock();
                        return false;
                    }
                }
            }
            catch (Exception ex)
            {
                this.dbConn?.Dispose();
                this.dbConn = null;
                this.Fault("Could not connect to the database.  Error Message: {0}", ex.Message);

                this.logger?.Critical(
                new LayoutContainer[]
                {
                    new LayoutText($"Database Schema Check threw an exception."),
                    new LayoutNameValue(ex.GetType().Name, ex.Message),
                    new LayoutNameValue("Stack", ex.StackTrace),
                    new LayoutText($"Class{Colon} {GetClassNameFromFilePath()}{Comma} Function{Colon}{GetFunctionName()} {At} {GetLineNumber()}{Comma} File{Colon} {HelperFunctions.GetRelativePath(GetFilePath())}"),
                });

                this.ReleaseDBConLock();
                return false;
            }

            this.ReleaseDBConLock();
            return true;
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
                case State_Event.Exit:
                    break;
                case State_Event.Poll:
                    if (this.dbConn?.GetConnection()?.State != System.Data.ConnectionState.Open)
                    {
                        string connectionString = string.Empty;

                        lock (this.settingsLock)
                        {
                            connectionString = this.connectionString;
                            this.oldConnectionString = this.connectionString;
                        }

                        if (connectionString != string.Empty)
                        {
                            this.UpdateStatus(GuiState.CONNECTING, "Connecting to the Database.  Please wait.");
                            bool success = this.ConnectToDatabase();

                            if (success)
                            {
                                this.StateTrans(DatabaseState.State_Online, this.State_Online);
                            }
                            else
                            {
                                this.StateTrans(DatabaseState.State_Fault, this.State_Fault);
                            }
                        }

                        this.delay = 0;
                    }
                    else if (this.delay > this.maxDelay)
                    {
                        this.StateTrans(DatabaseState.State_Fault, this.State_Fault);
                    }
                    else
                    {
                        this.UpdateStatus(GuiState.CONNECTING, "Connection to the Database.  ({0})", this.maxDelay - this.delay);
                        this.delay++;
                    }

                    break;
                default:
                    break;
            }
        }

        /// <summary>
        /// States the online.
        /// </summary>
        /// <param name="event">The @event.</param>
        private void State_Online(State_Event @event)
        {
            switch (@event)
            {
                case State_Event.Enter:
                    this.delay = 0;
                    this.UpdateStatus(GuiState.ONLINE, "Database Online.");
                    break;
                case State_Event.Poll:
                    bool reconnect = false;
                    lock (this.settingsLock)
                    {
                        reconnect = this.oldConnectionString != this.connectionString;
                    }

                    if (reconnect)
                    {
                        this.StateTrans(DatabaseState.State_Fault, this.State_Fault);
                    }
                    else
                    {
                        this.delay++;
                        if (this.dbConn?.GetConnection().State != System.Data.ConnectionState.Open)
                        {
                            this.logger.Fault("Database disconnected.");
                            this.StateTrans(DatabaseState.State_Fault, this.State_Fault);
                            return;
                        }
                        else
                        {
                            if (this.delay % 2 == 0)
                            {
                                this.delay = 0;
                                if (!this.AcquireDBConLockShort())
                                {
                                    return;
                                }
                                else
                                {
                                    if (!DatabaseUtils.PingDatabase((SqlConnection)this.dbConn.GetConnection(), this.logger, this.PingTimeout))
                                    {
                                        this.ReleaseDBConLock();
                                        this.logger.Fault("Database disconnected.");
                                        this.StateTrans(DatabaseState.State_Fault, this.State_Fault);
                                        return;
                                    }
                                    else
                                    {
                                        this.ReleaseDBConLock();
                                    }
                                }
                            }
                        }
                    }

                    break;
                case State_Event.Fault:
                    this.StateTrans(DatabaseState.State_Fault, this.State_Fault);
                    break;
                default:
                    break;
            }
        }

        /// <summary>
        /// States the fault.
        /// </summary>
        /// <param name="event">The @event.</param>
        private void State_Fault(State_Event @event)
        {
            switch (@event)
            {
                case State_Event.Enter:
                    this.UpdateStatus(GuiState.FAULT, "Failed to connect to the Database.");
                    this.delay = 0;
                    Monitor.Enter(this.dbConLockObj);
                    this.dbConn?.Dispose();
                    this.dbConn = null;
                    Monitor.Exit(this.dbConLockObj);
                    break;
                case State_Event.Poll:
                    if (this.delay > 5)
                    {
                        this.StateTrans(DatabaseState.State_Connect, this.State_Connect);
                    }
                    else
                    {
                        this.delay++;
                    }

                    break;
                default:
                    break;
            }
        }

        /// <summary>
        /// Loads the database settings.
        /// </summary>
        private void LoadDatabaseSettings()
        {
            string connectionStringDisplay = this.dbConfig.ConnectionString;
            string tempConnectionString = string.Empty;

            this.pingTimeout = this.dbConfig.PingTimeout;
            this.commandTimeout = this.dbConfig.CommandTimeout;

            connectionStringDisplay = this.dbConfig.ConnectionString;

            if (connectionStringDisplay.Trim() != string.Empty)
            {
                string[] connectionParams = connectionStringDisplay.Split(';');

                foreach (string parameterPair in connectionParams)
                {
                    string[] paramAndValue = parameterPair.Split('=');

                    if (paramAndValue.Length == 1)
                    {
                        tempConnectionString += paramAndValue[0] + ";";
                    }
                    else if (paramAndValue[0].ToUpper() == "USER" || paramAndValue[0].ToUpper() == "PASSWORD")
                    {
                        try
                        {
                            tempConnectionString += paramAndValue[0] + "=" + this.stringUtils.ToInternalString(paramAndValue[1].Replace("-", "/").Replace("_", "=")) + ";";
                        }
                        catch
                        {
                            tempConnectionString += paramAndValue[0] + "=" + paramAndValue[1].Replace("-", "/").Replace("_", "=") + ";";
                        }
                    }
                    else
                    {
                        tempConnectionString += paramAndValue[0] + "=" + paramAndValue[1] + ";";
                    }
                }

                tempConnectionString = tempConnectionString.Substring(0, tempConnectionString.Length - 1);

                // Here is where I only write to this resource, hence to check, we do not need to lock the resource
                if (this.connectionString != tempConnectionString)
                {
                    lock (this.settingsLock)
                    {
                        this.connectionString = tempConnectionString;
                    }
                }
            }
        }

        /// <summary>
        /// Tables the twe callback.
        /// </summary>
        /// <param name="sender">The source of the event.</param>
        /// <param name="e">The <see cref="DatabaseExecStatusEventArgs"/> instance containing the event data.</param>
        private void Table_tweCallback(object sender, DatabaseExecStatusEventArgs e)
        {
            // this.UpdateStatus(e.State, e.ExceptionMessage); TODO
            Log logEntry = this.logger.Log(Levels.Critical, "Database - Execution Exception");
            logEntry.AddLayout(new LayoutNameValue("Table Name", e.TableName));
            logEntry.AddLayout(new LayoutNameValue("Stored Procedure Name", e.StoredProcedureName));
            logEntry.AddLayout(new LayoutNameValue("Action", e.ActionType.ToString()));
            logEntry.AddLayout(new LayoutNameValue("Additional Info", e.AdditionalInfo));
            logEntry.AddLayout(new LayoutNameValue("Exception", e.ExceptionMessage));

            logEntry.Commit();
        }
    }
}
