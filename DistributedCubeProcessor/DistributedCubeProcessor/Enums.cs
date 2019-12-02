// <copyright file="Enums.cs" company="PlaceholderCompany">
// Copyright (c) PlaceholderCompany. All rights reserved.
// </copyright>

namespace DistributedCubeProcessor
{
    /// <summary>
    /// Enums
    /// </summary>
    public static class Enums
    {
        /// <summary>
        /// Command Type
        /// </summary>
        public enum CommandType
        {
            /// <summary>
            /// The emit lenght
            /// </summary>
            Emit_Lenght,

            /// <summary>
            /// The sort elements
            /// </summary>
            Sort_Elements,

            /// <summary>
            /// The publish stats
            /// </summary>
            Publish_Stats,

            /// <summary>
            /// The sort elements
            /// </summary>
            Display_Elements,

            /// <summary>
            /// The send element to
            /// </summary>
            Send_Element_to,

            /// <summary>
            /// The stat response
            /// </summary>
            Stat_Response,

            /// <summary>
            /// The publish initial stats
            /// </summary>
            Initial_Stat_Req,

            /// <summary>
            /// The initial stat response
            /// </summary>
            Initial_Stat_Response,
            Publish_NextValue,
            NextValue_Response,
        }
    }
}
