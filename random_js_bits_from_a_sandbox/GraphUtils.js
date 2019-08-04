/// <summary>
/// Initializes the cells.
/// </summary>
/// <param name="graph">The graph.</param>
/// <returns></returns>
function InitCells(graph) {
    
    var cells = graph.getChildVertices(graph.getDefaultParent());

    for (i in cells) {
        cells[i].InitCell();
    }
}

/// <summary>
/// Sets the click listner.
/// </summary>
/// <param name="graph">The graph.</param>
/// <returns></returns>
function setClickListner(homeScreen) {
    
    homeScreen.graph.addListener(
        mxEvent.CLICK,
        function (sender, event) {
            var selectedCell = event.getProperty('cell');
            onClickEvent(homeScreen, selectedCell);
        }
    );

    mxGraph.prototype.getCursorForMouseEvent = function (me) {

        if (me.evt.type == 'pointermove' || me.evt.type == 'mousemove') {
            var cell = me.getCell();

            if (cell.isEnabled === true && cell.ExtendedCellProperties && cell.ExtendedCellProperties.ClickActions) {

                for (i in cell.ExtendedCellProperties.ClickActions) {
                    if (cell.ExtendedCellProperties.ClickActions[i].ClickActionType !== -1) {
                        return 'pointer';
                    }
                }
            }
        }
    };
}

/// <summary>
/// Ons the click event.
/// </summary>
/// <param name="event">The event.</param>
/// <returns></returns>
function onClickEvent(homeScreen, event) {
    
    if ((event === undefined) || (event.id === undefined)) // Clicked on graph
        return;

    if (event.isEnabled === false) {
        return;
    }

    var cell = event;
    if (event.ExtendedCellProperties && event.ExtendedCellProperties.ClickActions) {
        for (i in event.ExtendedCellProperties.ClickActions) {
            var loopBreak = false;
            var clickAction = event.ExtendedCellProperties.ClickActions[i];

            switch (clickAction.ClickActionType) {
                case 0:
                    var success = homeScreen.SignalRConnectionObject.postDataAsInstructed(clickAction, cell);
                    if (success === false)
                        loopBreak = true;
                    break;
                case 1:
                    setTimeout(function () {
                        if (homeScreen.CarryFwdData === null)
                            window.location.href = '/?screenId=' + clickAction.NavigateTo;
                        else
                            window.location.href = '/?screenId=' + clickAction.NavigateTo + '&additionalParams=' + homeScreen.CarryFwdData;
                    }
                        , 500);

                    break;
                case 2:
                    ExecuteCellOperations(
                        clickAction,
                        cell,
                        homeScreen,
                        function (message) // Loop back
                        {
                            homeScreen.OnSignalRHubMessage(message)
                        },
                        function (message) { // functor to publish messages to multicast ntwk
                            homeScreen.SignalRConnectionObject.SendToSignalR(message)
                        });
                    break;
                case 3:
                    RequestLogin();
                    break;
                default:
                    break;
            }

            if (loopBreak)
                break;
        }
    }
}

/// <summary>
/// This is the execution environment for SignalR subscribed elements
/// </summary>
/// <param name="clickAction">The click action.</param>
/// <param name="originatingCell">The originating cell.</param>
/// <param name="homeScreen">The home screen.</param>
/// <param name="fnMessageLoopBack">The function message loop back.</param>
/// <param name="fnSignalRSenderCb">The function signal r sender cb.</param>
/// <returns></returns>
function ExecuteCellOperations(clickAction, originatingCell, homeScreen, fnMessageLoopBack, fnSignalRSenderCb) {

    var graph = homeScreen.graph;
    var cellNameDictionary = homeScreen.CellNameDictionary;
    var message = homeScreen.WindowMsg;
    var initiatingUser = homeScreen.LoggedInUser;

    if (clickAction != null && clickAction.Script != null && clickAction.Script.trim() != "") {
        try {
            eval(clickAction.Script);
        }
        catch (e) {
            console.error('Script Error : [ Exception : ' + e + ']');
        }
    }

    // These are the script API functions. But you still have the graph handy, Hence Anything is possible
    function HideElements(cells) {
        ShowHideElements(cells, true);
    }

    function ShowElements(cells) {
        ShowHideElements(cells, false);
    }

    function ShowHideElements(cells, hide) {
        ApplyChange(cells, 'opacity', hide ? 0 : 100);
    }

    function ChangeColor(cells, color) {
        ApplyChange(cells, 'fillColor', color);
    }

    function SetText(cells, Text) {
        ApplyChange(cells, 'value', Text);
    }

    function ChangeImage(cells, url) {
        ApplyChange(cells, 'ChangeImage', url);
    }

    function ChangeDynamicImageUrl(cells, url) {
        ApplyChange(cells, 'ChangeImageUrl', url);
    }

    function MarkElementsAsClicked(cells, color) {
        ApplyChange(cells, 'MarkCellSelected', color);
    }

    function MarkElementsAsUnclicked(cells) {
        ApplyChange(cells, 'MarkCellUnselected', "");
    }

    function FetchDataAndPublishToDestination(url, paramsObject, source, destination) {
        getDataFromUrl(url, paramsObject,
            function (data) {
                SendMessage(source, destination, data);
            },
            function (error) {
                console.error('Failed to get data from Url :' + url);
            });
    }

    function SendMessage(source, destination, dataobject) {
        var message = getPGmMsgFromObject(source, destination, dataObject, initiatingUser)

        if (message === null) {
            console.error('Invalid data.');
            return;
        }

        if (source === mxConstantsEx.DESTINATION_CARRY_FORWARD_DATA) {
            fnMessageLoopBack(message);
        }
        else {
            var strMessage = {};
            try {
                strMessage = JSON.stringify(message);
                if (fnSignalRSenderCb)
                    fnSignalRSenderCb(strMessage);
            }
            catch (e) {
                console.error('Failed to send message to SignalR : ' + e);
                return;
            }

        }
    }

    function ApplyChange(cells, attribute, value) {
        if (cells.constructor === Array) {
            for (i in cells) {
                var targetCellId = cellNameDictionary[cells[i]];

                if (targetCellId === null)
                    continue;

                var targetCell = graph.getModel().getCell(targetCellId);

                if (targetCell === null)
                    continue;

                targetCell.ApplyEvaluatedChanges(attribute, value);
            }
        }
        else if (typeof cells === "string") {
            var targetCellId = cellNameDictionary[cells];

            if (targetCellId === null)
                return;

            var targetCell = graph.getModel().getCell(targetCellId);

            if (targetCell === null)
                return;

            targetCell.ApplyEvaluatedChanges(attribute, value);
        }
        else {
            console.error("Invalid Element Name");
        }
    }
}