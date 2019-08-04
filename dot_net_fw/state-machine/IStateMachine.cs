// <copyright file="IStateMachine.cs" company="FooBar Australasia">
// Copyright (c) FooBar Australasia. All rights reserved.
// </copyright>

namespace FooBar.StateMachine
{
    using static FooBar.Common.Enums;

    /// <summary>
    /// Interface for generalized statemachine
    /// </summary>
    public interface IStateMachine
    {
        /// <summary>
        /// Gets the state.
        /// </summary>
        /// <value>
        /// The state.
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
        /// Emits the state.
        /// </summary>
        void EmitStatus();

        /// <summary>
        /// Releases unmanaged and - optionally - managed resources.
        /// </summary>
        void Dispose();
    }
}
