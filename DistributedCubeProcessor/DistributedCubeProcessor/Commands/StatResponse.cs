namespace DistributedCubeProcessor.Commands
{
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Text;
    using System.Threading.Tasks;
    using DistributedCubeProcessor.Interface;

    /// <summary>
    /// StatCommand
    /// </summary>
    /// <seealso cref="DistributedCubeProcessor.Commands.Command" />
    /// <seealso cref="DistributedCubeProcessor.Interface.ICommand" />
    public class StatResponse : Command, ICommand
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="StatResponse"/> class.
        /// </summary>
        public StatResponse()
        {
            this.Size = 0;
            this.Min = 0.0f;
            this.Max = 0.0f;
            this.CommandType = Enums.CommandType.Stat_Response;
        }

        /// <summary>
        /// Gets or sets the size.
        /// </summary>
        /// <value>
        /// The size.
        /// </value>
        public int Size { get; set; }

        /// <summary>
        /// Gets or sets the minimum.
        /// </summary>
        /// <value>
        /// The minimum.
        /// </value>
        public float Min { get; set; }

        /// <summary>
        /// Gets or sets the maximum.
        /// </summary>
        /// <value>
        /// The maximum.
        /// </value>
        public float Max { get; set; }
    }
}
