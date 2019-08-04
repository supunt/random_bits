//----------------------------------------------------------------
// Setup Click Actions Dialog
// This is used preview add or edit the click actions associated 
// to a given element
//----------------------------------------------------------------
var SetupClickActionsDialog = function (ui, cell) {
    var graph = ui.editor.graph;
    cell.ExtendedCellProperties = cell.ExtendedCellProperties == null ? {} : cell.ExtendedCellProperties;
    cell.ExtendedCellProperties.ClickActions == null ? [] : cell.ExtendedCellProperties.ClickActions;

    var clickActionList = GetClickActionList();

    var componentList = {};
    var screenList = {};
    var componentsLoaded = false;
    var screensLoaded = false;

    var div = document.createElement('div');
    InitDialogHeaderAndBody(div, 'Set Click Actions');

    var table = InitGrid(div);

    LoadScreenList(function (data) {
        screensLoaded = true;
        screenList = data;
        AttemptGridLoading(table);
    });

    LoadComponentList(function (data) {
        componentsLoaded = true;
        componentList = data;
        AttemptGridLoading(table);
    });

    // ---------------------------------------------------------------------------------------------
    AddButtonContainer(div,
        function () {
            cell.ExtendedCellProperties.ClickActions = [];
            for (var i = 1, row; row = table.rows[i]; i++) {
                if (row.data)
                    cell.ExtendedCellProperties.ClickActions.push(row.data);
            }
            ui.hideDialog(false);
        },
        function () {
            ui.hideDialog(true);
        });
    // ---------------------------------------------------------------------------------------------

    this.container = div;

    //---------------------------------------------------------------------------------------------
    function AttemptGridLoading(table) {
        if (!screensLoaded || !componentsLoaded)
            return;
        else {
            LoadGrid();
        }
    }

    //------------------------------------------------------------
    function LoadGrid() {
        if (cell.ExtendedCellProperties != null && cell.ExtendedCellProperties.ClickActions != null) {
            for (i in cell.ExtendedCellProperties.ClickActions) {
                AddAction(table, cell.ExtendedCellProperties.ClickActions[i]);
            }
        }

        // Special case ------------
        var navObject = ReOrderTable(table);
        if (navObject)
            AddAction(table, navObject);
        // END Special case --------

        AddNewEntryRow(table, 3);
    };

    //------------------------------------------------------------
    function GetClickActionList() {
        var ret = {};

        ret[ActionType.ACTION_PUBISH] = "Publish Message";
        ret[ActionType.ACTION_NAVIGATE] = "Navigate To Screen";
        ret[ActionType.ACTION_EXECUTE_SCRIPT] = "Execute Script";

        return ret;
    }
    //------------------------------------------------------------
    function InitGrid(div) {
        
        var tableContainer = document.createElement('div');

        tableContainer.className = 'tableContainerDiv400';

        var table = document.createElement('table');
        var thead = document.createElement('thead');

        table.id = 'clickActionsTable';
        table.className = 'geDialogTable genericElementTable';

        var tr = document.createElement('tr');

        //-- End custom columns --/
        tr.appendChild(createHeaderColumn('Action'));
        tr.appendChild(createHeaderColumn('Edit', '60px'));
        tr.appendChild(createHeaderColumn('Delete', '60px'));

        thead.appendChild(tr);
        table.appendChild(thead);

        tableContainer.appendChild(table);

        div.appendChild(tableContainer);

        return table;
    }
    //------------------------------------------------------------
    function AddAction(table, actionObject) {
        var row = document.createElement('tr');
        row.data = actionObject;

        var td = document.createElement('td');

        // element.options[element.selectedIndex].text
        td.appendChild(GetActionDescription(actionObject));
        row.appendChild(td);

        var td2 = document.createElement('td');
        var td3 = document.createElement('td');

        td2.className = 'inlineButtonWrapper';
        td3.className = 'inlineButtonWrapper';

        var editBtn = document.createElement('button');
        editBtn.className = 'geButton inlineAddEditButton';
        editBtn.innerHTML = 'Edit';

        editBtn.onclick = function () {

            switch (row.data.ClickActionType) {
                case ActionType.ACTION_PUBISH:
                    var dlg = new MessagePreviewDialog(ui, row.data, false, function (data) {
                        UpdateAction(table, data, row.rowIndex);
                    });

                    ui.showDialog(dlg.container, 600, dlg.container.height, true, false);
                    break;
                case ActionType.ACTION_NAVIGATE:
                    var dlg = new AddEditNavigateToDialog(ui, function (data) {
                        UpdateAction(table, data, row.rowIndex);
                    }, row.data);
                    ui.showDialog(dlg.container, 500, dlg.container.height, true, false);
                    break;
                case ActionType.ACTION_EXECUTE_SCRIPT:
                    var dlg = new AddEditScriptDialog(ui, row.data, false, function (data) {
                        UpdateAction(table, data, row.rowIndex);
                    });

                    ui.showDialog(dlg.container, 600, dlg.container.height, true, false);
                    break;
                default:
                    break;
            }
            
        };

        td2.appendChild(editBtn);

        var removeBtn = document.createElement('button');
        removeBtn.className = 'geButton inlineDeleteButton';
        removeBtn.innerHTML = 'x';

        removeBtn.onclick = function () {
            table.deleteRow(this.parentNode.parentNode.rowIndex);
        };

        td3.appendChild(removeBtn);

        row.appendChild(td2);
        row.appendChild(td3);
        table.appendChild(row);

        
    }
    //------------------------------------------------------------
    function UpdateAction(table, data, rowIndex) {
        var tr = table.rows[rowIndex];

        tr.data = data;

        var td = tr.firstChild;

        td.innerHTML = '';
        td.appendChild(GetActionDescription(data));
    }
    //------------------------------------------------------------
    function ReOrderTable(table) {
        var navRowCache = null;
        for (var i = 1, row; row = table.rows[i]; i++) {
            if (row.data && row.data.ClickActionType == ActionType.ACTION_NAVIGATE) {
                navRowCache = row.data;
                table.deleteRow(row.rowIndex);
                break;
            }
        }

        return navRowCache;
    }
    //------------------------------------------------------------
    function GetActionDescription(action) {
        switch (action.ClickActionType) {
            case ActionType.ACTION_NAVIGATE:
                var screenName = action.NavigateTo == "-1" ? 'Unknown/Deleted Screen' : GetScreenName(action.NavigateTo);

                var outterDiv = document.createElement('div');
                var descriptionDiv = document.createElement('div');
                var screenDiv = document.createElement('div');

                descriptionDiv.innerHTML = "Navigate To Screen";
                descriptionDiv.style.className = 'strong';

                screenDiv.innerHTML = 'Screen Name : ' + screenName;

                outterDiv.appendChild(descriptionDiv);
                outterDiv.appendChild(document.createElement('hr'));
                outterDiv.appendChild(screenDiv);
                return outterDiv;
                break;
            case ActionType.ACTION_PUBISH:
                var outterDiv = document.createElement('div');
                var descriptionDiv = document.createElement('div');
                var senderDiv = document.createElement('div');
                var ReceiverDiv = document.createElement('div');

                descriptionDiv.innerHTML = "Publish Message";
                descriptionDiv.style.fontWeight = 'strong';

                senderDiv.innerHTML = 'Sender : ' + action.Sender;
                ReceiverDiv.innerHTML = 'Receiver : ' + (action.Receiver == null ? '' : action.Receiver);

                outterDiv.appendChild(descriptionDiv);
                outterDiv.appendChild(document.createElement('hr'));
                outterDiv.appendChild(senderDiv);
                outterDiv.appendChild(ReceiverDiv);
                outterDiv.appendChild(createPreviewButton(ui, action));
                return outterDiv;
                break;
            case ActionType.ACTION_EXECUTE_SCRIPT:
                var outterDiv = document.createElement('div');
                var descriptionDiv = document.createElement('div');

                descriptionDiv.innerHTML = "Execute Script";
                descriptionDiv.style.fontWeight = 'strong';

                outterDiv.appendChild(descriptionDiv);
                outterDiv.appendChild(document.createElement('hr'));
                outterDiv.appendChild(createPreviewButton(ui, action));
                return outterDiv;
                break;
            default:
                return document.createTextNode("Unknown Action");
                break;
        }
    }

    //------------------------------------------------------------
    function createPreviewButton(ui, actionData) {
        var previewButton = document.createElement('button');
        previewButton.className = 'geButton bg-yellow';
        previewButton.innerHTML = 'Preview ' + (actionData.ClickActionType == ActionType.ACTION_PUBISH ? 'Message' : 'Script');

        previewButton.data = actionData;
        previewButton.onclick = function () {
            switch (this.data.ClickActionType) {
                case ActionType.ACTION_PUBISH:
                    var dlg = new MessagePreviewDialog(ui, this.data);
                    ui.showDialog(dlg.container, 600, dlg.container.height, true, false);
                    break;
                case ActionType.ACTION_EXECUTE_SCRIPT:
                    var dlg = new AddEditScriptDialog(ui, this.data);
                    ui.showDialog(dlg.container, 600, dlg.container.height, true, false);
                    break;
                default:
                    break;
            }
        };

        return previewButton;
    }
    //------------------------------------------------------------
    function GetScreenName(screenId) {
        for (var index in screenList) {
            if (screenList[index].ScreenId == screenId)
                return screenList[index].Name;
        }

        return 'DELETED_SCREEN';
    }

    //----------------------------------------------------------
    function AddNewEntryRow(table, colCount) {

        var row = document.createElement('tr');

        var td1 = document.createElement('td');

        var addBtn = document.createElement('button');
        addBtn.className = 'geButton inlineAddEditButton';
        addBtn.innerHTML = '+ Add';

        addBtn.onclick = function () {
            var self = this;
            var dlg = new ClickActionSelectorDialog(ui, getFilteredClickActions(),
                function (data) {
                    switch (parseInt(data)) {
                        case ActionType.ACTION_PUBISH:
                            var dlg = new MessagePreviewDialog(ui, null, false, function (returnData) {
                                table.deleteRow(row.rowIndex);
                                AddAction(table, returnData);

                                // Special case ------------
                                var navObject = ReOrderTable(table);
                                if (navObject)
                                    AddAction(table, navObject);
                                // END Special case --------

                                AddNewEntryRow(table, colCount);
                            });
                            ui.showDialog(dlg.container, 600, dlg.container.height, true, false);
                            break;
                        case ActionType.ACTION_NAVIGATE:
                            var dlg = new AddEditNavigateToDialog(ui, function (returnData) {
                                table.deleteRow(row.rowIndex);
                                AddAction(table, returnData);
                                AddNewEntryRow(table, colCount);
                            });
                            ui.showDialog(dlg.container, 500, dlg.container.height, true, false);
                            break;
                        case ActionType.ACTION_EXECUTE_SCRIPT:
                            var dlg = new AddEditScriptDialog(ui, null, false, function (returnData) {
                                table.deleteRow(row.rowIndex);
                                AddAction(table, returnData);

                                // Special case ------------
                                var navObject = ReOrderTable(table);
                                if (navObject)
                                    AddAction(table, navObject);
                                // END Special case --------

                                AddNewEntryRow(table, colCount);
                            });
                            ui.showDialog(dlg.container, 600, dlg.container.height, true, false);
                            break;
                        default:

                            
                            break;
                    }
                });
            ui.showDialog(dlg.container, 400, dlg.container.height, true, false);
        };

        td1.appendChild(addBtn);
        row.appendChild(td1);

        for (var i = 0; i < colCount - 1; ++i)
            row.appendChild(document.createElement('td'));

        table.appendChild(row);
    }

    //----------------------------------------------------------
    function getFilteredClickActions() {
        var navigateAvailable = false;
        for (var i = 1, row; row = table.rows[i]; i++) {
            if (row.data && row.data.ClickActionType == ActionType.ACTION_NAVIGATE)
                navigateAvailable = true;
        }

        var ret = {};
        for (var element in clickActionList) {
            if (navigateAvailable && element == ActionType.ACTION_NAVIGATE)
                continue;

            ret[element] = clickActionList[element];
        }

        return ret;
    }
}