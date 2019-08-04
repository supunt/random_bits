// -- Numeric evaluator for input fields --
function BindNumericEvaluators() {
    $(':input[type="number"]').keypress(function (evt) {

        var theEvent = evt || window.event;
        var key = theEvent.keyCode || theEvent.which;
        key = String.fromCharCode(key);
        var regex = /[0-9]|\./;
        if (!regex.test(key)) {
            theEvent.returnValue = false;
            if (theEvent.preventDefault) theEvent.preventDefault();
        }
    });
} 

// - Converts a 32 bit number to an array of bits
function ToBitArray(int32) {
    var base2_ = (int32).toString(2).split("").reverse().join("");
    var baseL_ = new Array(32 - base2_.length).join("0");
    var base2 = base2_ + baseL_;
    return base2;
} 

// -- Info container utility

function UpdateInfoContainer(type, message) {
    var container = document.getElementById('infoContainer');

    if (container == null)
        return;

    $('#infoContainer').fadeIn(1000);

    switch (type) {
        case "Success":
            container.data = "Success";
            container.classList.remove("infoAlert-warning");
            container.classList.remove("infoAlert-danger");
            container.classList.add("infoAlert-success");
            container.innerHTML = message;
            container.style.overflow = 'hidden';

            setTimeout(function () {
                //container.hidden = true;
                $('#infoContainer').fadeOut(1000);
            }, 4000);

            break;
        case "Error":
            container.style.overflow = 'auto';
            container.classList.remove("infoAlert-success");
            container.classList.remove("infoAlert-warning");
            container.classList.add("infoAlert-danger");

            container.innerHTML = '<p>' + message + '</p>';

            break;
        case "Warning":
            container.style.overflow = 'hidden';
            container.classList.remove("infoAlert-success");
            container.classList.remove("infoAlert-danger");
            container.classList.add("infoAlert-warning");
            break;
        default:
            break;
    }
};

// -- Session End callback function implementation
function SessionEnd(hub) {
    if (hub)
    {
        console.log('Live Feed terminated.')
        hub.connection.stop();
        hub.AutoReconnect = false;
    }

    WarningMsg('Your session has timed out. Redirecting', function () {
        window.location = "/Login/LogOut";
    }, "Session Expired");
};

/// <summary>
/// Creates a PGMPostMessage structured object
/// </summary>
/// <param name="clickAction">The click action.</param>
/// <param name="cell">The cell.</param>
/// <param name="carry">The carry.</param>
/// <returns>PGMPostMessage stringified</returns>
function getPGmMsgString(clickAction, cell, initiatingUser, carry = false) {
    var publication = clickAction.Publication;
    var pgmMsg = {};

    var propertyArray = [];

    if (carry == false) {
        pgmMsg[mxConstantsEx.PROPERTY_NAME_SOURCE] = clickAction.Sender;
        pgmMsg[mxConstantsEx.PROPERTY_NAME_DESTINATION] = clickAction.Receiver;

        var FEUser = {};
        FEUser[mxConstantsEx.ID_PROPERTY_NAME] = "Initiated User";
        FEUser[mxConstantsEx.ID_PROPERTY_VALUE] = initiatingUser;

        propertyArray.push(FEUser);
    }

    for (tag in publication.TagMappings) {
        var valueRefContainer = publication.TagMappings[tag];
        var tagValuePair = {};
        tagValuePair[mxConstantsEx.ID_PROPERTY_NAME] = valueRefContainer.Tag;

        if (valueRefContainer.CellId == '__Custom__') {
            // This makes it type aware, don't fuck it
            var objString = '{"tag":' + valueRefContainer.Property + '}';
            try {
                var jsonObject = JSON.parse(objString);
                tagValuePair[mxConstantsEx.ID_PROPERTY_VALUE] = jsonObject.tag;
                propertyArray.push(tagValuePair);
            }
            catch (e) {
                console.error('Tag building failed.');
                ErrorMsg('Error in Button setup. Please contact administrator.');
                return null;
            }
        }
        else {
            var associatedCell = cell.graph.getModel().getCell(valueRefContainer.CellId);
            if (associatedCell) {
                if (associatedCell.cellType == 'Table') {
                    if (associatedCell.selectedTableRow == null) {
                        associatedCell.highlightMySelf();
                        WarningMsg('Please select a row from the highlited table.');
                        return null;
                    }
                }

                tagValuePair[mxConstantsEx.ID_PROPERTY_VALUE] = associatedCell.getValueOf(valueRefContainer.Property);
                propertyArray.push(tagValuePair);
            }
        }
    }

    pgmMsg[mxConstantsEx.TAG_NAME_PROPERTIES] = propertyArray;
    return JSON.stringify(pgmMsg);
}

/// <summary>
/// Create PGMPost message from simple string
/// </summary>
/// <param name="source">The source.</param>
/// <param name="destination">The destination.</param>
/// <param name="dataObject">The data object.</param>
/// <param name="initiatingUser">The initiating user.</param>
/// <returns></returns>
function getPGmMsgFromObject(source, destination, dataObject, initiatingUser) {
    
    if (source == null || destination == null || dataObject == null || (typeof dataObject != 'object'))
        return null;

    var pgmMsg = {};
    pgmMsg[mxConstantsEx.PROPERTY_NAME_SOURCE] = source;
    pgmMsg[mxConstantsEx.PROPERTY_NAME_DESTINATION] = destination;

    var propertyArray = [];

    var FEUser = {};
    FEUser[mxConstantsEx.ID_PROPERTY_NAME] = "Initiated User";
    FEUser[mxConstantsEx.ID_PROPERTY_VALUE] = initiatingUser;

    propertyArray.push(FEUser);

    for (property in dataObject)
    {
        var tagValuePair = {};
        tagValuePair[mxConstantsEx.ID_PROPERTY_NAME] = property;
        tagValuePair[mxConstantsEx.ID_PROPERTY_VALUE] = dataObject[property];
        propertyArray.push(tagValuePair);
    }

    pgmMsg[mxConstantsEx.TAG_NAME_PROPERTIES] = propertyArray;

    return pgmMsg;
}

/// <summary>
/// Gets the data from URL.
/// </summary>
/// <param name="url">The URL.</param>
/// <param name="params">The parameters.</param>
/// <param name="dataCallback">The data callback.</param>
/// <param name="errorCallback">The error callback.</param>
/// <returns></returns>
function getDataFromUrl(url, params, dataCallback, errorCallback)
{
    if (params != null)
    {
        $.get(url, params, function (data) {
        }).done(function (data) {
            if (dataCallback != null)
                dataCallback(data);
        }).fail(function (error) {
            if (errorCallback != null)
                errorCallback(error);
        }
        );
    }
    else
    {
        $.get(url, function (data) {
        }).done(function (data) {
            if (dataCallback != null)
                dataCallback(data);
        }).fail(function (error) {
            if (errorCallback != null)
                errorCallback(error);
        });
    }
}

/// <summary>
/// Requests the login.
/// </summary>
/// <returns></returns>
function RequestLogin() {
    WarningMsg('Please login..');
}
