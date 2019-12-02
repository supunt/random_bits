// <copyright file="StatRequest.cs" company="PlaceholderCompany">
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
    /// StatRequest
    /// </summary>
    /// <seealso cref="DistributedCubeProcessor.Commands.Command" />
    public class StatRequest : Command, ICommand
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="StatRequest"/> class.
        /// </summary>
        public StatRequest()
        {
            this.CommandType = Enums.CommandType.Publish_Stats;
        }

        /// <summary>
        /// Gets or sets a value indicating whether this <see cref="StatRequest"/> is specific.
        /// </summary>
        /// <value>
        ///   <c>true</c> if specific; otherwise, <c>false</c>.
        /// </value>
        public bool Specific { get; set; }

        /// <summary>
        /// Gets or sets the minimum.
        /// </summary>
        /// <value>
        /// The minimum.
        /// </value>
        public float Min { get; set; }

        /// <summary>
        /// Gets or sets the minimum.
        /// </summary>
        /// <value>
        /// The minimum.
        /// </value>
        public float Max { get; set; }
    }
}
