// Used an existing implementation
// https://gist.github.com/KyleMit/aa4f576fa32bf36fbedab5540c18211d

SessionUpdater = (function () {
    var clientMovedSinceLastTimeout = false;
    var keepSessionAliveUrl = null;
    var timeout = 0;
    var timeoutCallback = null;
    var forcedKeepalive = false;

    function setupSessionUpdater(actionUrl, sesTo, timeoutCb, force = 0) {
        // store local value
        keepSessionAliveUrl = actionUrl;
        // setup handlers
        listenForChanges();

        // Find the minimum from 2 mins or sessionTimeout
        timeoutSec = sesTo;

        // Alert 15 seconds before
        timeout = (timeoutSec * 60 * 1000) - 15000; 

        timeoutCallback = timeoutCb;
        forcedKeepalive = force == 0 ? false : true;
        // start timeout - it'll run after n minutes
        checkToKeepSessionAlive();
    }

    function listenForChanges() {
        $("body").one("mousemove keydown", function () {
            clientMovedSinceLastTimeout = true;
        });
    }


    // fires minute - if there's been movement ping server and restart timer
    function checkToKeepSessionAlive() {
        setTimeout(function () {
            keepSessionAlive();
        }, timeout);
    }

    function keepSessionAlive() {
        if (forcedKeepalive && keepSessionAliveUrl != null)
        {
            $.ajax({
                type: "POST",
                url: keepSessionAliveUrl,
                success: function (data) {
                    // reset movement flag
                    clientMovedSinceLastTimeout = false;
                    // start listening for changes again
                    listenForChanges();
                    // restart timeout to check again in n minutes
                    checkToKeepSessionAlive();
                },
                error: function (data) {
                    console.log("Error posting to " & keepSessionAliveUrl);
                }
            });

            return;
        }
        // if we've had any movement since last run, ping the server
        if (clientMovedSinceLastTimeout && keepSessionAliveUrl != null) {
            $.ajax({
                type: "POST",
                url: keepSessionAliveUrl,
                success: function (data) {
                    // reset movement flag
                    clientMovedSinceLastTimeout = false;
                    // start listening for changes again
                    listenForChanges();
                    // restart timeout to check again in n minutes
                    checkToKeepSessionAlive();
                },
                error: function (data) {
                    console.log("Error posting to " & keepSessionAliveUrl);
                }
            });
        }
        else if (clientMovedSinceLastTimeout == false)
        {
            timeoutCallback();
        }
    }

    // export setup method
    return {
        Setup: setupSessionUpdater
    };

})();