/*  Generic Done and cancel button adder */
function AddButtonContainer(parentContainer, doneButtonCallback, cancelButtonCallback, doneButtonLabel = 'Done', cancelButtonLabel = 'Cancel', doneButtonVisible = true, cancelButtonVisible = true) {
    parentContainer.appendChild(document.createElement('hr'));

    var outterContainer = document.createElement('div');
    var btnContainer = document.createElement('div');
    outterContainer.className = 'buttonContainerOutterDiv';
    btnContainer.className = 'buttonContainerInnerDiv';

    var btnDone = mxUtils.button(doneButtonLabel, function (evt) {
        doneButtonCallback();
    });

    btnDone.className = 'headerButton';

    if (!doneButtonVisible)
        btnDone.style.display = 'none';

    btnContainer.appendChild(btnDone);

    var btnCancel = mxUtils.button(cancelButtonLabel, function (evt) {
        cancelButtonCallback();
    });

    btnCancel.className = 'headerButtonLast headerButtonCancel';

    if (!cancelButtonVisible)
        btnCancel.style.display = 'none';

    btnContainer.appendChild(btnCancel);
    outterContainer.appendChild(btnContainer)
    parentContainer.appendChild(outterContainer);
}


/* Function to handle tabs inside text areas */
var onTextAreaKeyDown = function (event) {
    if (event.keyCode === 9) {
        var v = this.value;
        s = this.selectionStart;
        e = this.selectionEnd;
        this.value = v.substring(0, s) + '\t' + v.substring(e);
        this.selectionStart = this.selectionEnd = s + 1;
        return false;
    }
}

/* Function to inject a Header to the dialogbox */
var InitDialogHeaderAndBody = function(container, title)
{
    container.style.className = 'dlg-container';

    var header = document.createElement('div');
    header.id = 'header';
    header.className = 'geDialogHeader';
    header.innerHTML = title;

    container.appendChild(header);
}

/* Function to mark errors in elements */
function MarkElementError(element) {
    element.style.backgroundColor = mxConstantsEx.InPutErrorColor;
}

/* Function to reset errors in elements */
function ClearElementError(element) {
    element.style.backgroundColor = 'white';
}

/* Function to load a list of components from DB */
function LoadComponentList(dataNotificationCB, addCarryFwdDataEntry = true) {
    $.get('/Home/GetAllComponents',
        function (data) {
        }).done(function (data) {
            var retData = [];

            if (addCarryFwdDataEntry) {
                var inject = {}
                inject.Id = mxConstantsEx.Txt_CarryFwdData;
                inject.Name = mxConstantsEx.Txt_CarryFwdData;
                retData.push(inject);
            }

            // Add everything after carryfwd data element
            for (index in data) {
                retData.push(data[index]);
            }

            if (dataNotificationCB)
                dataNotificationCB(retData);

        }).fail(function (error) {
            console.error('Failed to load component list.')
        });
}

/* Function to load a list of component tags from DB */
function LoadComponentTagList(componentName, dataNotificationCB) {
    $.get('/Home/GetTagsOfComponent?componentName=' + componentName,
        function (data) {
        }).done(function (data) {
            if (dataNotificationCB)
                dataNotificationCB(data);
        }).fail(function (error) {
            console.error('Faild to load component tags list for ' + selectComponent.value);
        });
}

/* Function to load a list of screen from DB */
function LoadScreenList(dataNotificationCB) {
    $.get('/Home/GetAllScreens',
        function (data) {
        }).done(function (data) {
            if (dataNotificationCB)
                dataNotificationCB(data);
        }).fail(function (error) {
            console.error('Failed to load views list.')
        });
}

function LoadAccessGroups(dataNotificationCB) {
    $.get('/Home/GetAccessGroups',
        function (data) {
        }).done(function (data) {
            if (dataNotificationCB)
                dataNotificationCB(data);
        }).fail(function (error) {
            console.error('Failed to load access groups.')
        });
}

/* Function to create a generic header colunm for a table */
function createHeaderColumn(txt = null, maxWidth = null, width = null) {
    var th = document.createElement('th');

    if (txt != null) {
        var tn = document.createTextNode(txt);
        th.appendChild(tn);
    }

    if (maxWidth != null)
        th.style.maxWidth = maxWidth;

    if (width != null)
        th.style.width = width;

    return th;
}

/* Create a label and a select div for dialogs */
function createLabelAndSelectBlock(labelText = '') {
    var div = createDivForInput();
    var label = createLabel(labelText);
    var select = createSelect();

    div.appendChild(label);
    div.appendChild(select);

    return { container: div, select: select };
}


/* Create a label and a select div for dialogs */
function createLabelAndTextInputBlock(labelText = '') {
    var div = createDivForInput();
    var label = createLabel(labelText);
    var input = createInput();

    div.appendChild(label);
    div.appendChild(input);

    return { container: div, input: input };
}

/* Create a label and a select div for dialogs */
function createLabelAndCheckBoxInputBlock(labelText = '') {
    var div = createDivForInput();
    var label = createLabel(labelText);
    var input = createInput('checkbox');

    div.appendChild(label);
    div.appendChild(input);

    return { container: div, checkbox: input };
}

/* Create a label and a select div for dialogs */
function createLabelAndNumberInputBlock(labelText = '') {
    var div = createDivForInput();
    var label = createLabel(labelText);
    var input = createInput('number');

    div.appendChild(label);
    div.appendChild(input);

    return { container: div, input: input };
}

// create a generic textArea for scripts
function createTextAreaBlockForScript(labelText = '') {
    var div = createDivForInput();
    var label = createLabel(labelText);
    var textArea = createTextArea();

    div.appendChild(label);
    div.appendChild(textArea);

    return { container: div, textArea: textArea };
}

// create a generic label
function createLabel(labelText = '') {
    var label = document.createElement('label');
    label.style.display = 'inline';
    label.innerHTML = labelText;

    return label;
}

// create a generic select
function createSelect() {
    var select = document.createElement('select');
    select.className = 'dialog-select'

    return select;
}

// create a generic input of type
function createInput(inputType = 'text') {
    var input = document.createElement('input');
    input.type = inputType;
    input.className = 'dialog-' + inputType;

    return input;
}

// create a generic input of type
function createTextArea() {
    var txtArea = document.createElement('textarea');
    txtArea.className = 'expressionBuilder';

    return txtArea;
}

// create a generic select
function createDivForInput() {
    var div = document.createElement('div');
    div.className = 'dialogFieldDiv';

    return div;
}

function createTitleDiv(title) {
    var div = document.createElement('div');
    div.className = 'titelDiv';
    div.innerHTML = title;

    return div;
}



