// <copyright file="Program.cs" company="PlaceholderCompany">
// Copyright (c) PlaceholderCompany. All rights reserved.
// </copyright>

namespace DistributedCubeProcessor
{
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Text;
    using System.Threading.Tasks;
    using DistributedCubeProcessor.Interface;
    using log4net;

    /// <summary>
    /// The Program
    /// </summary>
    public class Program
    {
        /// <summary>
        /// The log
        /// </summary>
        private static readonly ILog Log = LogManager.GetLogger("Parent-Application");

        /// <summary>
        /// The parent node
        /// </summary>
        private static INode parentNode;

        /// <summary>
        /// Mains the specified arguments.
        /// </summary>
        /// <param name="args">The arguments.</param>
        public static void Main(string[] args)
        {
            // n items in cube, m items in sub cube
            // Sorting time complexity - O(mlog(m)) [Per node] (This is C# hence the sort algo decided on the fly) https://msdn.microsoft.com/en-us/library/w56d4y5z(v=vs.110).aspx
            // Get next Element - O(m) [Per node]
            // Get Find - O(log(m)) [Per node]

            // using basic logger
            log4net.Config.XmlConfigurator.Configure();

            Log.Info("Starting Application.");

            Log.Info("Creating Parent Node");
            parentNode = new ParentNode(4);
            Log.Info("Starting Parent Node");
            parentNode.StartNode();

            Console.ReadKey();
        }
    }
}
