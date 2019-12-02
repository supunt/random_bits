// <copyright file="NextValueResponse.cs" company="PlaceholderCompany">
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
    /// NextValueResponse
    /// </summary>
    public class NextValueResponse : Command, ICommand
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="NextValueResponse"/> class.
        /// </summary>
        public NextValueResponse()
        {
            this.CommandType = Enums.CommandType.NextValue_Response;
        }

        /// <summary>
        /// Gets or sets the next value.
        /// </summary>
        /// <value>
        /// The next value.
        /// </value>
        public float NextValue { get; set; }
    }
}
