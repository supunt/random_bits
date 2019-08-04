// <copyright file="BaseStateMachine.cs" company="FooBar Australasia">
// Copyright (c) FooBar Australasia. All rights reserved.
// </copyright>

namespace FooBar.StateMachine
{
    using System.ComponentModel;
    using System.Globalization;
    using System.Text;
    using System.Timers;
    using FooBar.Common;
    using FooBar.Common.EventArguments;
    using FooBar.Logger;
    using static FooBar.Common.Enums;
    using static FooBar.Logger.Color;
    using static FooBar.Utilities.CompilerServices.FunctionInformation;

    /// <summary>
    /// StateMachine
    /// </summary>
    public class BaseStateMachine : IStateMachine
    {
        /// <summary>
        /// The logger manager name
        /// </summary>
        private static string className = GetClassNameFromFilePath();

        /// <summary>
        /// The poll timer
        /// </summary>
        private Timer pollTimer;

        /// <summary>
        /// The state of the state machine
        /// </summary>
        private GuiState state;

        /// <summary>
        /// The state message
        /// </summary>
        private string stateMessage;

        /// <summary>
        /// The status update lock object
        /// </summary>
        private object statusUpdateLockObj;

        /// <summary>
        /// The device logger
        /// </summary>
        private ILogger logger;

        /// <summary>
        /// The event execute lock
        /// </summary>
        private object eventExecLock;

        /// <summary>
        /// Initializes a new instance of the <see cref="BaseStateMachine" /> class.
        /// </summary>
        /// <param name="deviceLogger">The logger MGR.</param>
        public BaseStateMachine(IDeviceLogger deviceLogger)
        {
            this.logger = deviceLogger.CreateComponentLogger(className);
            this.state = GuiState.DISCONNECTED;
            this.stateMessage = "Not Connected";
            this.CurrentState = this.State_None;
            this.eventExecLock = new object();
            this.statusUpdateLockObj = new object();
        }

        /// <summary>
        /// state_call delegate
        /// </summary>
        /// <param name="event">The event.</param>
        public delegate void State_Call(State_Event @event);

        /// <summary>
        /// Occurs when [status changed].
        /// </summary>
        public event StatusChangedEventHandler StatusChanged;

        /// <summary>
        /// Gets or sets gets the status.
        /// </summary>
        /// <value>
        /// The status.
        /// </value>
        public GuiState State { get => this.state; protected set => this.state = value; }

        /// <summary>
        /// Gets or sets gets the state message.
        /// </summary>
        /// <value>
        /// The state message.
        /// </value>
        public string StateMessage { get => this.stateMessage; protected set => this.stateMessage = value; }

        /// <summary>
        /// Gets or sets the current state
        /// </summary>
        /// <value>
        /// The state of the current.
        /// </value>
        protected State_Call CurrentState { get; set; }

        /// <summary>
        /// Releases unmanaged and - optionally - managed resources.
        /// </summary>
        public virtual void Dispose()
        {
            this.pollTimer?.Dispose();
        }

        /// <summary>
        /// Called when [event].
        /// </summary>
        /// <param name="event">The event.</param>
        protected void OnEvent(State_Event @event)
        {
            lock (this.eventExecLock)
            {
                if (this.CurrentState == null)
                {
                    throw new System.ArgumentNullException("Current state has not been initilised");
                }
                else
                {
                    this.CurrentState(@event);
                }
            }
        }

        /// <summary>
        /// States the trans.
        /// </summary>
        /// <param name="newState">The new state.</param>
        protected void StateTrans(State_Call newState)
        {
            if (newState == null)
            {
                throw new System.ArgumentNullException("New state must not be Nothing");
            }
            else if (newState == this.CurrentState)
            {
                throw new System.ArgumentException("Can not transition to the same state.");
            }
            else
            {
                lock (this.eventExecLock)
                {
                    this.OnEvent(State_Event.Exit);
                    this.CurrentState = newState;
                    this.OnEvent(State_Event.Enter);
                }
            }
        }

        /// <summary>
        /// Starts the state machine.
        /// </summary>
        /// <param name="initialState">The initial state.</param>
        protected void StartStateMachine(State_Call initialState)
        {
            this.pollTimer = new Timer(1000);
            this.pollTimer.Elapsed += this.PollTimer_Callback;
            this.pollTimer.Enabled = true;
            this.StateTrans(initialState);
        }

        /// <summary>
        /// Starts the state machine.
        /// </summary>
        /// <param name="initialState">The initial state.</param>
        /// <param name="timerThreadSyncObject">The timer thread synchronize object.</param>
        protected void StartStateMachine(State_Call initialState, ISynchronizeInvoke timerThreadSyncObject)
        {
            this.pollTimer = new Timer(1000)
            {
                SynchronizingObject = timerThreadSyncObject
            };
            this.pollTimer.Elapsed += this.PollTimer_Callback;
            this.pollTimer.Enabled = true;
            this.StateTrans(initialState);
        }

        /// <summary>
        /// Updates the status.
        /// </summary>
        /// <param name="guiState">The state.</param>
        /// <param name="format">The format.</param>
        /// <param name="formatParams">The parameter array.</param>
        protected virtual void UpdateStatus(GuiState guiState, string format, params object[] formatParams)
        {
            lock (this.statusUpdateLockObj)
            {
                StringBuilder messageWriter = new StringBuilder();

                messageWriter.AppendFormat(CultureInfo.InvariantCulture, format, formatParams);

                string message = messageWriter.ToString();
                if (this.state != guiState || this.stateMessage != message)
                {
                    switch (guiState)
                    {
                        case GuiState.DISCONNECTED:
                            this.logger.Warning($"{Yellow}{message}");
                            break;
                        case GuiState.FAULT:
                            this.logger.Fault($"{Red}{message}");
                            break;
                        default:
                            this.logger.Information(message);
                            break;
                    }

                    this.state = guiState;
                    this.stateMessage = message;
                }

                this.StatusChanged?.Invoke(this, new StatusChangedEventArgs() { State = guiState, Message = message });
            }
        }

        /// <summary>
        /// States the connect.
        /// </summary>
        /// <param name="event">The event.</param>
        protected void State_None(State_Event @event)
        {
        }

        /// <summary>
        /// Handles the Callback event of the PollTimer control.
        /// </summary>
        /// <param name="sender">The source of the event.</param>
        /// <param name="e">The <see cref="ElapsedEventArgs"/> instance containing the event data.</param>
        private void PollTimer_Callback(object sender, ElapsedEventArgs e)
        {
            object lockObj = new object();

            lock (lockObj)
            {
                this.OnEvent(State_Event.Poll);
            }
        }
    }
}
