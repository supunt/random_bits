/// <summary>
/// SignalRConnection object
/// </summary>
/// <param name="scope">The scope.</param>
/// <returns></returns>
SignalRConnection = function (homeScreen) {
    this.HomeScreen = homeScreen;
}

SignalRConnection.prototype.HomeScreen == null;

SignalRConnection.prototype.SignalRConnection == null;

SignalRConnection.prototype.connection == null;

SignalRConnection.prototype.hub = null;

SignalRConnection.prototype.AutoReconnect = true;

SignalRConnection.prototype.SignalRConnectionState = false;

SignalRConnection.prototype.SignalRUrl = null;


/// <summary>
/// Starts the signal r.
/// </summary>
/// <param name="scope">The scope.</param>
/// <returns></returns>
SignalRConnection.prototype.startSignalR = function() {
    if (this.NeedSignalR == false)
        return;

    var self = this;
    if (this.SignalRUrl == null) {
        $.get("/Common/GetSignalRURL", function (data) {

        }).done(function (data) {
            self.SignalRUrl = data;
            self.connect2SignalRHub();
        });
    }
    else {
        self.connect2SignalRHub();
    }
}

/// <summary>
/// Connect2s the signal r hub.
/// </summary>
/// <param name="scope">The scope.</param>
/// <returns></returns>
SignalRConnection.prototype.connect2SignalRHub = function() {

    var self = this;

    if (this.connection == null)
        this.connection = $.hubConnection(this.SignalRUrl);

    if (this.hub == null) {
        this.hub = this.connection.createHubProxy("R5SignalRHub");

        if (this.hub == null) {

            UpdateInfoContainer('Error', 'Not Connected to Live feed.')
            self.Reconnect2SignalR();
            return;
        }

        this.hub.connection.disconnected(function () {
            this.SignalRConnectionState = false;

            if (this.AutoReconnect == false)
                return;

            UpdateInfoContainer('Error', 'Live feed disconnected, Attemping secondary reconnect.');
            self.Reconnect2SignalR();
            return;
        });

        this.hub.connection.reconnecting(function () {
            self.SignalRConnectionState = false;
            UpdateInfoContainer('Error', 'Live feed disconnected, Attemping auto reconnect.')
        });

        this.hub.connection.reconnected(function () {
            self.SignalRConnectionState = true;
            UpdateInfoContainer('Info', 'Live feed reconnected.');

            setTimeout(function () {
                self.SendInitialTransactions(self.HomeScreen.Tags);
            }, 100)

        });

        // Create a function that the hub can call back to display messages.
        this.hub.on("UpdateInfo",
            function (message) {
                self.HomeScreen.OnSignalRHubMessage(message)
            });
    }

    this.hub.connection.start({ waitForPageLoad: false }).done(function () {
        console.log('Connected to Live Feed at :' + self.SignalRUrl);
        self.ConnectionID = self.hub.connection.id;
        self.SignalRConnectionState = true;
        self.SendInitialTransactions(self.HomeScreen.Tags);
    }).fail(function (error) {
        console.error('Could not connect to Live Feed --> ' + (error == null ? '' : error.message));

        UpdateInfoContainer('Error', 'Could not connect to Live feed');
    });
}

/// <summary>
/// Reconnect2s the signal r.
/// </summary>
/// <param name="scope">The scope.</param>
/// <returns></returns>
SignalRConnection.prototype.Reconnect2SignalR = function() {
    // Session timed out and will not need to reconnect
    var self = this;
    if (this.AutoReconnect == false)
        return;

    setTimeout(function () {
        self.startSignalR();
    }, 10000);
}

/// <summary>
/// Sends the Tag Subscription and sends a download request
/// </summary>
/// <param name="theHub">The hub.</param>
/// <param name="tagArray">The tag array.</param>
/// <returns>none</returns>
SignalRConnection.prototype.SendInitialTransactions = function(tagArray) {
    var self = this;

    self.hub.invoke("SendInterestedTags", tagArray, self.hub.connection.id).done(function () {
        console.debug('Initial Subscription ---');
        console.debug(JSON.stringify(tagArray));
        console.debug('-----------------------');

        console.debug('Connected to SignalR [guid:' + self.hub.connection.id + '].');
        UpdateInfoContainer('Success', 'Connected to Live feed.');

        self.hub.invoke("InitialUpdateRequest", self.hub.connection.id).done(function () {
            console.debug('Initial update request sent successfully.');
        }).fail(function (error) {
            console.error('Initial loadup failed : ' + error == null ? '' : error);

            UpdateInfoContainer('Error', 'Live feed, Initial loadup failed. Please refresh the browser');

        });
    }).fail(function (error) {
        console.error('Initial subscription failed : ' + error == null ? '' : error);
        UpdateInfoContainer('Error', 'Live feed, Initial subscription failed. Please refresh the browser');
    });
}

/// <summary>
/// Posts the data as instructed.
/// </summary>
/// <param name="clickAction">The click action.</param>
/// <param name="originatingCell">The originating cell.</param>
/// <param name="scope">The scope.</param>
/// <param name="initiatingUser">The initiating user.</param>
/// <returns></returns>
SignalRConnection.prototype.postDataAsInstructed = function(clickAction, originatingCell, initiatingUser = null) {
    // Do not need SignalR
    var initiatinUserName = initiatingUser != null ? initiatingUser : this.HomeScreen.LoggedInUser;
    if (clickAction.Receiver == mxConstantsEx.DESTINATION_CARRY_FORWARD_DATA) {
        var pgmMessge = getPGmMsgString(clickAction, originatingCell, initiatinUserName, true);
        if (pgmMessge == null)
            return false;

        this.HomeScreen.CarryFwdData = btoa(pgmMessge);

        return true;
    }
    else {
        if (this.SignalRConnectionState == true) {
            var pgmMessge = getPGmMsgString(clickAction, originatingCell, initiatinUserName);
            if (pgmMessge == null)
                return false;

            this.SendToSignalR(pgmMessge);
        }
        else {
            ErrorMsg('Action Failed, Not connected to Live feed');
            return false;
        }
    }
}

/// <summary>
/// Sends to signal r.
/// </summary>
/// <param name="hub">The hub.</param>
/// <param name="messageJsonString">The message json string.</param>
/// <returns></returns>
SignalRConnection.prototype.SendToSignalR = function(messageJsonString)
{
    this.hub.invoke("OnClientPGMMessage", messageJsonString, this.hub.connection.id).done(function () {
    }).fail(function (error) {
        console.error('Failed to send message : ' + error);
    }).done(function () {
        console.debug('Product data published');
    });
}

/// <summary>
/// Disconnect the hub connection
/// </summary>
/// <param name="hub">The hub.</param>
/// <param name="messageJsonString">The message json string.</param>
/// <returns></returns>
SignalRConnection.prototype.Disconnect = function () {
    this.AutoReconnect = false;

    if (this.hub) {
        console.debug('Live Feed terminated.')
        this.hub.connection.stop();
    }
}