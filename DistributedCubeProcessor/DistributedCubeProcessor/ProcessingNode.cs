// <copyright file="Node.cs" company="PlaceholderCompany">
// Copyright (c) PlaceholderCompany. All rights reserved.
// </copyright>

namespace DistributedCubeProcessor
{
    using System;
    using System.Collections.Concurrent;
    using System.Collections.Generic;
    using System.IO;
    using System.Linq;
    using System.Security;
    using System.Text;
    using System.Threading;
    using System.Threading.Tasks;
    using DistributedCubeProcessor.Interface;
    using log4net;
    using Newtonsoft.Json;
    using static System.Net.Mime.MediaTypeNames;
    using DistributedCubeProcessor.Commands;

    /// <summary>
    /// Node is where the data is processed minimalistically
    /// Each node runs in a thread. Did not go for multi-processing at this time of the day
    /// </summary>
    public class ProcessingNode : INode, IDisposable
    {
        /// <summary>
        /// The identifier
        /// </summary>
        private int id;

        /// <summary>
        /// The data file path
        /// </summary>
        private string dataFilePath;

        /// <summary>
        /// The log
        /// </summary>
        private ILog logger;

        /// <summary>
        /// The cancellation token source
        /// </summary>
        private CancellationTokenSource cancellationTokenSource;

        /// <summary>
        /// The token
        /// </summary>
        private CancellationToken token;

        /// <summary>
        /// The command queue
        /// </summary>
        private ConcurrentQueue<ICommand> commandQueue;

        /// <summary>
        /// The thread
        /// </summary>
        private Thread thread;

        /// <summary>
        /// The node data
        /// </summary>
        private List<float> nodeData;

        /// <summary>
        /// Initializes a new instance of the <see cref="ProcessingNode"/> class.
        /// </summary>
        /// <param name="id">The identifier.</param>
        public ProcessingNode(int id)
        {
            this.id = id;
            this.logger = LogManager.GetLogger($"Processing_Node_{id}");
            this.dataFilePath = System.IO.Directory.GetCurrentDirectory() + $"\\Data\\Node_{id}.txt";
            this.cancellationTokenSource = new CancellationTokenSource();
            this.token = this.cancellationTokenSource.Token;
            this.commandQueue = new ConcurrentQueue<ICommand>();
            this.thread = new Thread(new ThreadStart(this.StartThread));
        }

        /// <summary>
        /// Queues the command.
        /// </summary>
        public void StartNode()
        {
            this.thread.Start();
        }

        /// <summary>
        /// Performs application-defined tasks associated with freeing, releasing, or resetting unmanaged resources.
        /// </summary>
        public void Dispose()
        {
            this.logger.Info($"Node_{this.id} Disposing.");
            this.cancellationTokenSource.Cancel();
            this.thread.Join();
            this.logger = null;
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
        /// Loads the node data.
        /// </summary>
        /// <returns>If the data loading is successful or not</returns>
        private bool LoadNodeData()
        {
            if (!File.Exists(this.dataFilePath))
            {
                this.logger.Error($"Data file '{this.dataFilePath}' does not exist.");
                return false;
            }

            string data = string.Empty;
            try
            {
                data = File.ReadAllText(this.dataFilePath);
            }
            catch (Exception ex) when (ex is ArgumentException ||
                                       ex is ArgumentNullException ||
                                       ex is PathTooLongException ||
                                       ex is DirectoryNotFoundException ||
                                       ex is IOException ||
                                       ex is NotSupportedException ||
                                       ex is UnauthorizedAccessException ||
                                       ex is FileNotFoundException ||
                                       ex is SecurityException)
            {
                this.logger.Error($"Failed to read configuration file. {ex.Message}");
                return false;
            }

            if (data.Trim() == string.Empty)
            {
                this.logger.Error("Data filed has no Data.");
                return true;
            }

            try
            {
                this.nodeData = JsonConvert.DeserializeObject<List<float>>(data);
            }
            catch (Exception)
            {
                this.logger.Error("Data filed is in wrong format.");
            }

            this.logger.Info("Data filed loaded.");
            return true;
        }

        /// <summary>
        /// Starts the thread.
        /// </summary>
        private void StartThread()
        {
            this.logger.Info($"Node_{this.id} Starting");

            if (!this.LoadNodeData())
            {
                this.Dispose();
            }

            while (!this.token.IsCancellationRequested)
            {
                try
                {
                    ICommand command = null;
                    if (this.commandQueue.TryDequeue(out command))
                    {
                        switch (command.CommandType)
                        {
                            case Enums.CommandType.Sort_Elements:
                                this.logger.Debug("Sort Elements Request");
                                this.nodeData?.Sort(); // TODO space complexity
                                break;
                            case Enums.CommandType.Display_Elements:
                                this.logger.Debug("Sort Elements Request");
                                this.logger.Debug(this.nodeData);
                                break;
                            case Enums.CommandType.Initial_Stat_Req:
                                this.logger.Debug("Publish Initial Stats Request");
                                command.Sender.QueueCommand(new StatResponse()
                                {
                                    Sender = this,
                                    CommandType = Enums.CommandType.Initial_Stat_Response,
                                    Size = this.nodeData?.Count ?? 0,
                                    Min = this.nodeData?[0] ?? 0,
                                    Max = this.nodeData?[this.nodeData.Count - 1] ?? 0,
                                });
                                break;
                            case Enums.CommandType.Publish_Stats:
                                StatRequest sr = (StatRequest)command;
                                StatResponse sresp = this.GetStatsForSpecificRange(sr.Min, sr.Max);
                                command.Sender.QueueCommand(sresp);
                                break;
                            case Enums.CommandType.Publish_NextValue:
                                NextValueRequest nvr = (NextValueRequest)command;
                                NextValueResponse nxtValResp = this.GetNextValueInQueue(nvr.CurrentValue);
                                command.Sender.QueueCommand(nxtValResp);
                                break;
                            default:
                                this.logger.Debug("Unhandled Command. Ignoring");
                                break;
                        }
                    }
                }
                catch (Exception ex)
                {
                    this.logger.Fatal("Exception Occured");
                    this.logger.Fatal($"Exception Data - {ex.Message}");
                    this.logger.Fatal($"Inner Exception Data - {ex.InnerException?.Message}");
                    this.logger.Fatal($"Stack Trace - {ex.StackTrace}");
                }
            }
        }

        /// <summary>
        /// Gets the next value in queue.
        /// </summary>
        /// <param name="currentValue">The current value.</param>
        /// <returns>NextValueResponse</returns>
        private NextValueResponse GetNextValueInQueue(float currentValue)
        {
            NextValueResponse nvr = new NextValueResponse();
            nvr.NextValue = currentValue;

            if (this.nodeData == null)
            {
                return nvr;
            }

            for (int i = 0; i < this.nodeData.Count; i++)
            {
                if (this.nodeData[i] == currentValue)
                {
                    if ((i + 1) != this.nodeData.Count)
                    {
                        nvr.NextValue = this.nodeData[i + 1];
                        return nvr;
                    }
                }
            }

            return nvr;
        }

        /// <summary>
        /// Gets the stats for specific range.
        /// </summary>
        /// <param name="min">The minimum.</param>
        /// <param name="max">The maximum.</param>
        /// <returns>StatResponse</returns>
        private StatResponse GetStatsForSpecificRange(float min, float max)
        {
            StatResponse response = new StatResponse();
            response.Max = float.MinValue;
            response.Min = float.MaxValue;

            if (this.nodeData == null)
            {
                response.Min = 0;
                response.Max = 0;
                return response;
            }

            for (int i = 0; i < this.nodeData.Count && this.nodeData[i] <= max; i++)
            {
                if (this.nodeData[i] >= min)
                {
                    response.Size++;
                }

                if (response.Max <= this.nodeData[i])
                {
                    response.Max = this.nodeData[i];
                }

                if (response.Min > this.nodeData[i])
                {
                    response.Min = this.nodeData[i];
                }
            }

            return response;
        }
    }
}
