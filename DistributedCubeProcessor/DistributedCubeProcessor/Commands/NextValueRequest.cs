// <copyright file="NextValueRequest.cs" company="PlaceholderCompany">
// Copyright (c) PlaceholderCompany. All rights reserved.
// </copyright>

namespace DistributedCubeProcessor.Commands
{
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Text;
    using System.Threading.Tasks;
    using DistributedCubeProcessor.Interface;

    /// <summary>
    /// NextValueRequest
    /// </summary>
    /// <seealso cref="DistributedCubeProcessor.Commands.Command" />
    /// <seealso cref="DistributedCubeProcessor.Interface.ICommand" />
    public class NextValueRequest : Command, ICommand
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="NextValueRequest"/> class.
        /// </summary>
        public NextValueRequest()
        {
            this.CommandType = Enums.CommandType.Publish_NextValue;
        }

        /// <summary>
        /// Gets or sets the current value.
        /// </summary>
        /// <value>
        /// The current value.
        /// </value>
        public float CurrentValue { get; set; }
    }
}
