// <copyright file="IPlc.cs" company="FooBar Australasia">
// Copyright (c) FooBar Australasia. All rights reserved.
// </copyright>

namespace FooBar.Plc
{
    using FooBar.Common;
    using static global::FooBar.Plc.Plc;
    using static FooBar.Common.Enums;

    /// <summary>
    /// PLC interface
    /// </summary>
    public interface IPlc
    {
        /// <summary>
        /// The system event
        /// </summary>
        event PlcSystemEventHandler PlcSystemInformationEvent;

        /// <summary>
        /// The system event
        /// </summary>
        event PlcBinaryEventHandler DrawCloseEvent;

        /// <summary>
        /// The system event
        /// </summary>
        event PlcBinaryEventHandler VisionSensorStrobeFlash;

        /// <summary>
        /// Occurs when [vision draw closed lamp].
        /// </summary>
        event PlcBinaryEventHandler VisionDrawClosedLamp;

        /// <summary>
        /// Occurs when [status changed].
        /// </summary>
        event StatusChangedEventHandler StatusChanged;

        /// <summary>
        /// Gets the status.
        /// </summary>
        /// <value>
        /// The status.
        /// </value>
        GuiState State { get; }

        /// <summary>
        /// Gets the state message.
        /// </summary>
        /// <value>
        /// The state message.
        /// </value>
        string StateMessage { get; }

        /// <summary>
        /// Emits the information.
        /// </summary>
        void EmitInformation();

        /// <summary>
        /// Emits the state.
        /// </summary>
        void EmitStatus();

        /// <summary>
        /// Enables the PLC.
        /// </summary>
        void EnablePlc();

        /// <summary>
        /// Releases unmanaged and - optionally - managed resources.
        /// </summary>
        void Dispose();
    }
}
