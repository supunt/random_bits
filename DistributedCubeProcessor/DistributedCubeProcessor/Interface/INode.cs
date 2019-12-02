// <copyright file="INode.cs" company="PlaceholderCompany">
// Copyright (c) PlaceholderCompany. All rights reserved.
// </copyright>

namespace DistributedCubeProcessor.Interface
{
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Text;
    using System.Threading.Tasks;

    /// <summary>
    /// Node interface
    /// </summary>
    public interface INode
    {
        /// <summary>
        /// Queues the command.
        /// </summary>
        /// <param name="command">The command.</param>
        void QueueCommand(ICommand command);

        /// <summary>
        /// Starts the node.
        /// </summary>
        void StartNode();

        /// <summary>
        /// Releases unmanaged and - optionally - managed resources.
        /// </summary>
        void Dispose();
    }
}
