// <copyright file="StateMachine.cs" company="FooBar Australasia">
// Copyright (c) FooBar Australasia. All rights reserved.
// </copyright>

namespace FooBar.StateMachine
{
    using System;
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
    using static System.FormattableString;

    /// <summary>
    /// StateMachine
    /// </summary>
    /// <typeparam name="T">Enum template</typeparam>
    /// <seealso cref="FooBar.StateMachine.IStateMachine" />
    public class StateMachine<T> : IStateMachine, IDisposable
    {
        /// <summary>
        /// The logger manager name
        /// </summary>
        private static string className = GetClassNameFromFilePath();

        /// <summary>
        /// The state of the state machine
        /// </summary>
        private T internalStateEnum;

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
        /// The current state
        /// </summary>
        private StateCall currentState;

        /// <summary>
        /// The event execute lock
        /// </summary>
        private object eventExecLock;

        /// <summary>
        /// The is disposed
        /// </summary>
        private bool isDisposed;

        /// <summary>
        /// Initializes a new instance of the <see cref="StateMachine{T}"/> class.
        /// </summary>
        /// <param name="deviceLogger">The logger MGR.</param>
        public StateMachine(IDeviceLogger deviceLogger)
        {
            if (deviceLogger == null)
            {
                throw new ArgumentNullException("deviceLogger", "Device Logger cannot be null");
            }

            this.logger = deviceLogger.CreateComponentLogger(className);
            this.state = GuiState.DISCONNECTED;
            this.internalStateEnum = default(T);
            this.stateMessage = "Not Connected";
            this.currentState = this.StateNone;
            this.eventExecLock = new object();
            this.statusUpdateLockObj = new object();
            this.isDisposed = false;
        }

        /// <summary>
        /// state_call delegate
        /// </summary>
        /// <param name="event">The event.</param>
        protected delegate void StateCall(State_Event @event);

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
        public GuiState State
        {
            get
            {
                GuiState retState = GuiState.FAULT;
                lock (this.statusUpdateLockObj)
                {
                    retState = this.state;
                }

                return retState;
            }

            protected set
            {
                lock (this.statusUpdateLockObj)
                {
                    this.state = value;
                }
            }
        }

        // { get => this.state; protected set => this.state = value; }

        /// <summary>
        /// Gets or sets gets the state message.
        /// </summary>
        /// <value>
        /// The state message.
        /// </value>
        public string StateMessage
        {
            get
            {
                string retStateMsg = string.Empty;
                lock (this.statusUpdateLockObj)
                {
                    retStateMsg = this.stateMessage;
                }

                return retStateMsg;
            }

            protected set
            {
                lock (this.statusUpdateLockObj)
                {
                    this.stateMessage = value;
                }
            }
        }

        /// <summary>
        /// Gets gets or sets the current state
        /// </summary>
        /// <value>
        /// The state of the current.
        /// </value>
        protected StateCall CurrentState => this.currentState;

        /// <summary>
        /// Gets the internal state enum.
        /// </summary>
        /// <value>
        /// The internal state enum.
        /// </value>
        protected T InternalStateEnum { get => this.internalStateEnum; }

        /// <summary>
        /// Releases unmanaged and - optionally - managed resources.
        /// </summary>
        public void Dispose()
        {
            this.Dispose(true);
            GC.SuppressFinalize(this);
        }

        /// <summary>
        /// Emits the state.
        /// </summary>
        public void EmitStatus()
        {
            lock (this.statusUpdateLockObj)
            {
                this.StatusChanged?.Invoke(this, new StatusChangedEventArgs() { State = this.State, Message = this.StateMessage });
            }
        }

        /// <summary>
        /// Releases unmanaged and - optionally - managed resources.
        /// </summary>
        /// <param name="disposing"><c>true</c> to release both managed and unmanaged resources; <c>false</c> to release only unmanaged resources.</param>
        protected virtual void Dispose(bool disposing)
        {
            if (!this.isDisposed)
            {
                if (disposing)
                {
                    if (this.pollTimer != null)
                    {
                        this.pollTimer.Elapsed -= this.PollTimer_Callback;
                    }

                    this.pollTimer?.Dispose();
                    this.pollTimer = null;
                }

                this.isDisposed = true;
            }
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
                    throw new ArgumentNullException("CurrentState", "'CurrentState' has not been initialised");
                }
                else
                {
                    this.currentState(@event);
                }
            }
        }

        /// <summary>
        /// States the trans.
        /// </summary>
        /// <param name="newStateEnum">The new state enum.</param>
        /// <param name="newState">The new state.</param>
        /// <exception cref="ArgumentNullException">New state must not be Nothing</exception>
        /// <exception cref="ArgumentException">Can not transition to the same state.</exception>
        protected void StateTrans(T newStateEnum, StateCall newState)
        {
            if (newState == null)
            {
                throw new ArgumentNullException("newState", "New state must not be null");
            }
            else if (newState == this.CurrentState)
            {
                throw new ArgumentException("Can not transition to the same state.");
            }
            else
            {
                lock (this.eventExecLock)
                {
                    this.OnEvent(State_Event.Exit);
                    this.internalStateEnum = newStateEnum;
                    this.currentState = newState;
                    this.OnEvent(State_Event.Enter);
                }
            }
        }

        /// <summary>
        /// Starts the state machine.
        /// </summary>
        /// <param name="startStateEnum">The start state enum.</param>
        /// <param name="initialState">The initial state.</param>
        /// <param name="enableTimer">if set to <c>true</c> [enable timer].</param>
        /// /// <param name="timerThreadSyncObject">The timer thread synchronize object.</param>
        protected void StartStateMachine(
            T startStateEnum,
            StateCall initialState,
            bool enableTimer = true,
            ISynchronizeInvoke timerThreadSyncObject = null)
        {
            if (enableTimer)
            {
                this.pollTimer = new Timer(1000);
                this.pollTimer.Elapsed += this.PollTimer_Callback;
                this.pollTimer.Enabled = true;
            }

            if (timerThreadSyncObject != null)
            {
                this.pollTimer.SynchronizingObject = timerThreadSyncObject;
            }

            this.StateTrans(startStateEnum, initialState);
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
                            this.logger.Warning(Invariant($"{Yellow}{message}"));
                            break;
                        case GuiState.FAULT:
                            this.logger.Fault(Invariant($"{Red}{message}"));
                            break;
                        default:
                            this.logger.Information(Invariant($"{Green}{message}"));
                            break;
                    }

                    this.state = guiState;
                    this.stateMessage = message;
                }
            }

            this.StatusChanged?.Invoke(this, new StatusChangedEventArgs() { State = this.State, Message = this.StateMessage });
        }

        /// <summary>
        /// States the connect.
        /// </summary>
        /// <param name="event">The event.</param>
        protected void StateNone(State_Event @event)
        {
        }

        /// <summary>
        /// Handles the Callback event of the PollTimer control.
        /// </summary>
        /// <param name="sender">The source of the event.</param>
        /// <param name="e">The <see cref="ElapsedEventArgs"/> instance containing the event data.</param>
        private void PollTimer_Callback(object sender, ElapsedEventArgs e)
        {
            this.OnEvent(State_Event.Poll);
        }
    }
}
