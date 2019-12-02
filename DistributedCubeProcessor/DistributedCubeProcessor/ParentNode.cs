// <copyright file="ParentNode.cs" company="PlaceholderCompany">
// Copyright (c) PlaceholderCompany. All rights reserved.
// </copyright>

namespace DistributedCubeProcessor
{
    using System;
    using System.Collections.Concurrent;
    using System.Collections.Generic;
    using System.Linq;
    using System.Text;
    using System.Threading.Tasks;
    using DistributedCubeProcessor.Commands;
    using DistributedCubeProcessor.Interface;
    using log4net;

    /// <summary>
    /// ParentNode
    /// </summary>
    public class ParentNode : INode
    {
        /// <summary>
        /// The element count
        /// </summary>
        private int elementCount;

        /// <summary>
        /// The minimum across nodes
        /// </summary>
        private float minAcrossNodes;

        /// <summary>
        /// The maximum across nodes
        /// </summary>
        private float maxAcrossNodes;

        /// <summary>
        /// The node count
        /// </summary>
        private int nodeCount;

        /// <summary>
        /// The log
        /// </summary>
        private ILog logger;

        /// <summary>
        /// The command queue
        /// </summary>
        private ConcurrentQueue<ICommand> commandQueue;

        /// <summary>
        /// The processing nodes
        /// </summary>
        private SortedDictionary<int, INode> processingNodes;

        /// <summary>
        /// Initializes a new instance of the <see cref="ParentNode" /> class.
        /// </summary>
        /// <param name="nodeCount">The node count.</param>
        public ParentNode(int nodeCount)
        {
            this.nodeCount = nodeCount;
            this.commandQueue = new ConcurrentQueue<ICommand>();
            this.elementCount = 0;
            this.minAcrossNodes = float.MaxValue;
            this.maxAcrossNodes = float.MinValue;
            this.logger = LogManager.GetLogger("Parent_Node");

            this.processingNodes = new SortedDictionary<int, INode>();
            for (int i = 0; i < nodeCount; i++)
            {
                this.processingNodes.Add(i, new ProcessingNode(i));
            }
        }

        /// <summary>
        /// Releases unmanaged and - optionally - managed resources.
        /// </summary>
        public void Dispose()
        {
            foreach (INode node in this.processingNodes.Values)
            {
                node.Dispose();
            }
        }

        /// <summary>
        /// Queues the command.
        /// </summary>
        /// <param name="command">The command.</param>
        public void QueueCommand(ICommand command)
        {
            this.commandQueue.Enqueue(command);
        }

        /// <summary>
        /// Queues the command.
        /// </summary>
        public void StartNode()
        {
            this.logger.Info("Staring Processing nodes");
            foreach (INode node in this.processingNodes.Values)
            {
                node.StartNode();
            }

            foreach (INode node in this.processingNodes.Values)
            {
                node.QueueCommand(new Command()
                {
                    Sender = this,
                    CommandType = Enums.CommandType.Sort_Elements
                });
            }

            foreach (INode node in this.processingNodes.Values)
            {
                node.QueueCommand(new Command()
                {
                    Sender = this,
                    CommandType = Enums.CommandType.Display_Elements
                });
            }

            foreach (INode node in this.processingNodes.Values)
            {
                node.QueueCommand(new StatRequest()
                {
                    Sender = this,
                    Specific = false,
                    CommandType = Enums.CommandType.Initial_Stat_Req
                });
            }

            while (this.commandQueue.Count != this.nodeCount)
            {
                System.Threading.Thread.Sleep(100);
            }

            ICommand command;
            while (!this.commandQueue.IsEmpty)
            {
                this.commandQueue.TryDequeue(out command);

                if (command != null && command.CommandType == Enums.CommandType.Initial_Stat_Response)
                {
                    this.elementCount += ((StatResponse)command).Size;

                    if (this.minAcrossNodes >= ((StatResponse)command).Min)
                    {
                        this.minAcrossNodes = ((StatResponse)command).Min;
                    }

                    if (this.maxAcrossNodes <= ((StatResponse)command).Max)
                    {
                        this.maxAcrossNodes = ((StatResponse)command).Max;
                    }
                }
            }

            this.logger.Info($"Reported Stats\n" +
                $"\tElement Count {this.elementCount}\n" +
                $"\tGlobal Min : {this.minAcrossNodes}\n" +
                $"\tGlobal Max {this.maxAcrossNodes}");

            int lookupvalue = this.elementCount;

            // For odds we add one so it brings the correct element
            if (this.elementCount % 2 == 1)
            {
                lookupvalue++;
            }

            float median = this.FindMedian(lookupvalue / 2, this.minAcrossNodes, this.maxAcrossNodes);

            if (this.elementCount % 2 == 1)
            {
                this.logger.Info($"Median is {median}");
                Console.WriteLine($"Median found : {median}");
                this.Dispose();
            }
            else
            {
                float firstMedian = median;

                foreach (INode node in this.processingNodes.Values)
                {
                    node.QueueCommand(new NextValueRequest()
                    {
                        Sender = this,
                        CurrentValue = median,
                        CommandType = Enums.CommandType.Publish_NextValue
                    });
                }

                while (this.commandQueue.Count != this.nodeCount)
                {
                    System.Threading.Thread.Sleep(100);
                }

                // If not assigned no worries
                float nextValue = median;
                ICommand lastCommand = null;
                while (!this.commandQueue.IsEmpty)
                {
                    this.commandQueue.TryDequeue(out lastCommand);

                    if (lastCommand != null && lastCommand.CommandType == Enums.CommandType.NextValue_Response)
                    {
                        if (nextValue < ((NextValueResponse)lastCommand).NextValue)
                        {
                            nextValue = ((NextValueResponse)lastCommand).NextValue;
                        }
                    }
                }

                this.logger.Info($"Median is {(median + nextValue) / 2}");
                Console.WriteLine($"Median found : {(median + nextValue) / 2}");
                this.Dispose();
            }
        }

        /// <summary>
        /// Finds the median.
        /// </summary>
        /// <param name="expectedElementCount">The expected element count.</param>
        /// <param name="expectedMin">The expected minimum.</param>
        /// <param name="expectedMax">The expected maximum.</param>
        /// <returns>This returns the median of a odd set or first median of the even set</returns>
        private float FindMedian(int expectedElementCount, float expectedMin, float expectedMax)
        {
            this.logger.Info($"Search for Stats\n" +
                $"\tElement Count {expectedElementCount}\n" +
                $"\tRecursive Min : {expectedMin}\n" +
                $"\tRecursive Max {expectedMax}");

            int localEementCount = 0;
            float localMax = float.MinValue;
            float localMin = float.MaxValue;

            foreach (INode node in this.processingNodes.Values)
            {
                node.QueueCommand(new StatRequest()
                {
                    Sender = this,
                    Specific = true,
                    Min = expectedMin,
                    Max = expectedMax,
                    CommandType = Enums.CommandType.Publish_Stats
                });
            }

            while (this.commandQueue.Count != this.nodeCount)
            {
                System.Threading.Thread.Sleep(100);
            }

            ICommand command = null;
            while (!this.commandQueue.IsEmpty)
            {
                this.commandQueue.TryDequeue(out command);

                if (command != null && command.CommandType == Enums.CommandType.Stat_Response)
                {
                    localEementCount += ((StatResponse)command).Size;
                    if (localMax <= ((StatResponse)command).Max)
                    {
                        localMax = ((StatResponse)command).Max;
                    }

                    if (localMin > ((StatResponse)command).Min)
                    {
                        localMin = ((StatResponse)command).Min;
                    }
                }
            }

            this.logger.Info($"Resulted search Stats\n" +
                $"\tElement Count {localEementCount}\n" +
                $"\tRecursive Min : {localMin}\n" +
                $"\tRecursive Max {localMax}");

            if (localEementCount == expectedElementCount)
            {
                return localMax;
            }
            else if (localEementCount > expectedElementCount) 
            {
                return this.FindMedian(expectedElementCount, expectedMin, expectedMax / 2);
            }
            else
            {
                return this.FindMedian(expectedElementCount, expectedMin, expectedMax + (expectedMax / 2));
            }
        }
    }
}
