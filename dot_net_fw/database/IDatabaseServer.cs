// <copyright file="IDatabaseServer.cs" company="FooBar Australasia">
// Copyright (c) FooBar Australasia. All rights reserved.
// </copyright>

namespace FooBar.Database
{
    using FooBar.Common;
    using static FooBar.Common.Enums;

    /// <summary>
    /// DatabaseServer interface
    /// </summary>
    public interface IDatabaseServer
    {
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
        /// Gets the transform table.
        /// </summary>
        /// <value>
        /// The transform table.
        /// </value>
        TransformTable.TransformTable Transforms { get; }

        /// <summary>
        /// Gets the Messages table.
        /// </summary>
        /// <value>
        /// The transform table.
        /// </value>
        MessageTable.MessageTable Messages { get; }

        /// <summary>
        /// Gets the Locations table.
        /// </summary>
        /// <value>
        /// The transform table.
        /// </value>
        LocationTable.LocationTable Locations { get; }

        /// <summary>
        /// Gets the Inspections table.
        /// </summary>
        /// <value>
        /// The transform table.
        /// </value>
        InspectionTable.InspectionTable Inspections { get; }

        /// <summary>
        /// Gets the results.
        /// </summary>
        /// <value>
        /// The results.
        /// </value>
        ResultTable.ResultTable Results { get; }

        /// <summary>
        /// Gets or sets gets the connection string.
        /// </summary>
        /// <value>
        /// The connection string.
        /// </value>
        string ConnectionString { get; set;  }

        /// <summary>
        /// Gets the connection string.
        /// </summary>
        /// <value>
        /// The connection string.
        /// </value>
        IDatabaseConnection DbCon { get; }

        /// <summary>
        /// Gets or sets the command timeout.
        /// </summary>
        /// <value>
        /// The command timeout.
        /// </value>
        int CommandTimeout { get; set; }

        /// <summary>
        /// Gets or sets the ping timeout.
        /// </summary>
        /// <value>
        /// The ping timeout.
        /// </value>
        int PingTimeout { get; set; }

        /// <summary>
        /// Emits the state.
        /// </summary>
        void EmitStatus();

        /// <summary>
        /// Releases unmanaged and - optionally - managed resources.
        /// </summary>
        void Dispose();

        /// <summary>
        /// Acquires the database con lock.
        /// </summary>
        /// <returns>bool</returns>
        bool AcquireDBConLock();

        /// <summary>
        /// Releases the database con lock.
        /// </summary>
        void ReleaseDBConLock();

        /// <summary>
        /// Stops the database server.
        /// </summary>
        void StopDatabaseServer();
    }
}
