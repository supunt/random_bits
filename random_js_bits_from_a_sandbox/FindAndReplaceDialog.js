//---------------------------------------------------------------
// Find And Replace Dialog
//---------------------------------------------------------------
var FindAndReplaceDialog = function (ui, cells) {
    var graph = ui.editor.graph;

    var div = document.createElement('div');
    InitDialogHeaderAndBody(div, 'Find and Replace');

    var query = document.createElement('div');
    query.style.className = 'geDialogMiniBlock';
    var actions = document.createElement('div');
    query.style.className = 'geDialogMiniBlock';
    var body = document.createElement('div');
    query.style.className = 'geDialogLargeBlock';

    //-----------------------------------------------------
    var findLbl = document.createElement('label');
    findLbl.innerHTML = 'Find';
    findLbl.className = 'geDialogGeneralInputLbl';

    var findInput = document.createElement('input');
    findInput.type = 'text';
    findInput.className = 'geDialogGeneralInput';

    var replaceLbl = document.createElement('label');
    replaceLbl.innerHTML = 'Replace with ';
    replaceLbl.className = 'geDialogGeneralInputLbl';

    var replaceInput = document.createElement('input');
    replaceInput.type = 'text';
    replaceInput.className = 'geDialogGeneralInput';

    var seperator = document.createElement('hr');

    query.appendChild(findLbl);
    query.appendChild(findInput);
    query.appendChild(replaceLbl);
    query.appendChild(replaceInput);

    //-----------------------------------------------------

    var btnAnalyze = mxUtils.button("Analyze", function (evt) {
        if (cells.length === 0)
            return;

        if (findInput.value.trim() === '')
            return;

        // Clear table ---
        var tableRows = table.getElementsByTagName('tr');
        var rowCount = tableRows.length;

        for (var x = rowCount - 1; x > 0; x--) {
            table.removeChild(tableRows[x]);
        }

        var headerCheckboxArr = table.getElementsByTagName('input');
        headerCheckboxArr[0].checked = false;

        // ------------------------------------------------------------------------------------------------------------------------------
        for (index in cells) {
            if (cells[index].value) {
                if (chkCase.checked) {
                    if (cells[index].value.indexOf(findInput.value) >= 0) {
                        addRow(table, cells[index].id, 'Value', cells[index].value, cells[index], 'root', -1, null, -1, 'value');
                    }
                }
                else {
                    if (cells[index].value.toLowerCase().indexOf(findInput.value.toLowerCase()) >= 0) {
                        addRow(table, cells[index].id, 'Value', cells[index].value, cells[index], 'root', -1, null, -1, 'value');
                    }
                }
            }
            if (cells[index].ExtendedCellProperties) {
                var cellData = cells[index].ExtendedCellProperties;
                if (cellData.Subscriptions) {
                    for (i in cellData.Subscriptions) {
                        var currentSubscription = cellData.Subscriptions[i];
                        for (prop in currentSubscription) {
                            var propertyData = currentSubscription[prop];

                            // Match strings only
                            if ((typeof propertyData === 'string' || propertyData instanceof String) === false)
                                continue;

                            if (chkCase.checked) {
                                if (propertyData.indexOf(findInput.value) >= 0) {
                                    addRow(table, cells[index].id, prop + ' of Subscriptions at index ' + i, propertyData, cells[index], 'Subscriptions', i, null, -1, prop);
                                }
                            }
                            else {
                                if (propertyData.toLowerCase().indexOf(findInput.value.toLowerCase()) >= 0) {
                                    addRow(table, cells[index].id, prop + ' of Subscriptions at index ' + i, propertyData, cells[index], 'Subscriptions', i, null, -1, prop);
                                }
                            }
                        }
                    }
                }
                if (cellData.ImageDataObject) {
                    for (prop in cellData.ImageDataObject) {
                        var propertyData = cellData.ImageDataObject[prop];

                        // Match strings only
                        if ((typeof propertyData === 'string' || propertyData instanceof String) === false)
                            continue;

                        if (chkCase.checked) {
                            if (propertyData.indexOf(findInput.value) >= 0) {
                                addRow(table, cells[index].id, prop + ' of ImageDataObject', propertyData, cells[index], 'ImageDataObject', -1, null, -1, prop);
                            }
                        }
                        else {
                            if (propertyData.toLowerCase().indexOf(findInput.value.toLowerCase()) >= 0) {
                                addRow(table, cells[index].id, prop + ' of Subscriptions', propertyData, cells[index], 'ImageDataObject', -1, null, -1, prop);
                            }
                        }
                    }
                }
                if (cellData.TableDataObject) {
                    for (prop in cellData.TableDataObject) {
                        var propertyData = cellData.TableDataObject[prop];

                        // Match strings only
                        if ((typeof propertyData === 'string' || propertyData instanceof String) === false)
                            continue;

                        if (chkCase.checked) {
                            if (propertyData.indexOf(findInput.value) >= 0) {
                                addRow(table, cells[index].id, prop + ' of TableDataObject', propertyData, cells[index], 'TableDataObject', -1, null, -1, prop);
                            }
                        }
                        else {
                            if (propertyData.toLowerCase().indexOf(findInput.value.toLowerCase()) >= 0) {
                                addRow(table, cells[index].id, prop + ' of TableDataObject', propertyData, cells[index], 'TableDataObject', -1, null, -1, prop);
                            }
                        }
                    }
                }
                if (cellData.ClickActions) {
                    for (i in cellData.ClickActions) {
                        var currentClickAction = cellData.ClickActions[i];

                        for (prop in currentClickAction) {
                            var propertyData = currentClickAction[prop];

                            if (propertyData instanceof Object) {
                                var publication = propertyData;
                                for (iProp in publication) {
                                    var publicationProperty = publication[iProp];

                                    // Match strings only
                                    if ((typeof publicationProperty === 'string' || publicationProperty instanceof String) === false)
                                        continue;

                                    if (chkCase.checked) {
                                        if (publicationProperty.indexOf(findInput.value) >= 0) {
                                            addRow(table, cells[index].id, prop + ' of publication of ClickActions at index ' + i, publicationProperty, cells[index], 'ClickActions', i, 'Publication', -1, iProp);
                                        }
                                    }
                                    else {
                                        if (publicationProperty.toLowerCase().indexOf(findInput.value.toLowerCase()) >= 0) {
                                            addRow(table, cells[index].id, prop + ' of publication of ClickActions at index ' + i, publicationProperty, cells[index], 'ClickActions', i, 'Publication', -1, iProp);
                                        }
                                    }
                                }
                            }
                            else {
                                // Match strings only
                                if ((typeof propertyData === 'string' || publicationProperty instanceof String) === false)
                                    continue;

                                if (chkCase.checked) {
                                    if (propertyData.indexOf(findInput.value) >= 0) {
                                        addRow(table, cells[index].id, prop + ' of ClickActions at index ' + i, propertyData, cells[index], 'ClickActions', i, null, -1, prop);
                                    }
                                }
                                else {
                                    if (propertyData.toLowerCase().indexOf(findInput.value.toLowerCase()) >= 0) {
                                        addRow(table, cells[index].id, prop + ' of ClickActions at index ' + i, propertyData, cells[index], 'ClickActions', i, null, -1, prop);
                                    }
                                }
                            }
                        }

                    }
                }
            }


        }

    });

    var btnReplace = mxUtils.button("Replace", function (evt) {
        var table = document.getElementById('findReplaceTable');

        for (var i = 0, row; row = table.rows[i]; i++) {
            if (row.data && row.data.checked) {
                var cell = row.data.cell;
                switch (row.data.object) {
                    case 'root':
                        var initialString = cell[row.data.property];
                        var replaced = initialString.replace(new RegExp(findInput.value, chkCase.checked ? 'g' : 'gi'), replaceInput.value);
                        graph.getModel().setValue(cell, replaced);
                        break;
                    default:
                        var currentNode = cell.ExtendedCellProperties[row.data.object];

                        if (row.data.arrIndex != -1) {
                            var arrObject = currentNode[row.data.arrIndex];
                            if (row.data.innerObject === null) {
                                var initialString = arrObject[row.data.property];
                                var replaced = initialString.replace(new RegExp(findInput.value, chkCase.checked ? 'g' : 'gi'), replaceInput.value);
                                arrObject[row.data.property] = replaced;
                            }
                            else {
                                var innerObject = arrObject[row.data.innerObject];
                                var initialString = innerObject[row.data.property];
                                var replaced = initialString.replace(new RegExp(findInput.value, chkCase.checked ? 'g' : 'gi'), replaceInput.value);
                                innerObject[row.data.property] = replaced;
                            }

                        }
                        else {
                            if (row.data.innerObject == null) {
                                var initialString = currentNode[row.data.property];
                                var replaced = initialString.replace(new RegExp(findInput.value, chkCase.checked ? 'g' : 'gi'), replaceInput.value);
                                currentNode[row.data.property] = replaced;
                            }
                            else {
                                var innerObject = currentNode[row.data.innerObject];
                                var initialString = innerObject[row.data.property];
                                var replaced = initialString.replace(new RegExp(findInput.value, chkCase.checked ? 'g' : 'gi'), replaceInput.value);
                                innerObject[row.data.property] = replaced;
                            }
                        }
                        break;
                }
            }
        }
    });

    //-----------------------------------------------------
    var caseSensDiv = document.createElement('div');
    var caseLbl = document.createElement('label');

    caseLbl.innerHTML = 'Case Sensitive';
    caseLbl.className = 'geDialogGeneralInputLbl';

    chkCase = document.createElement('input');
    chkCase.type = 'checkbox';
    chkCase.checked = false;

    caseSensDiv.appendChild(caseLbl);
    caseSensDiv.appendChild(chkCase);

    //-----------------------------------------------------
    actions.appendChild(btnAnalyze);
    actions.appendChild(btnReplace);
    actions.appendChild(caseSensDiv);

    //-----------------------------------------------------
    // creating table
    var table = document.createElement('table');
    var thead = document.createElement('thead');

    table.id = 'findReplaceTable';
    table.className = 'geDialogTable';

    var tr = document.createElement('tr');
    var th1 = document.createElement('th');
    var th2 = document.createElement('th');
    var th3 = document.createElement('th');
    var th4 = document.createElement('th');

    var t1 = document.createElement('input');
    t1.type = 'checkbox';
    t1.checked = false;
    t1.id = 'headerChk';
    t1.onchange = function () {
        for (var i = 1, row; row = table.rows[i]; i++) {
            if (row.cells[0].firstChild.checked != this.checked) {
                row.cells[0].firstChild.checked = this.checked;
                row.cells[0].firstChild.onchange();
            }
        }
    }
    var t2 = document.createTextNode('ID');
    var t3 = document.createTextNode('Property');
    var t4 = document.createTextNode('Maching String');

    th1.appendChild(t1);
    th2.appendChild(t2);
    th3.appendChild(t3);
    th4.appendChild(t4);

    tr.appendChild(th1);
    tr.appendChild(th2);
    tr.appendChild(th3);
    tr.appendChild(th4);

    thead.appendChild(tr);
    table.appendChild(thead);

    body.appendChild(table);

    //-----------------------------------------------------

    function addRow(table, elementId, propertyName, string, cell, object, arrIndex = -1, innerObject, innerArrIndex = -1, property) {
        var tr = document.createElement('tr');
        var rowData = {};
        rowData['cell'] = cell;
        rowData['object'] = object;
        rowData['arrIndex'] = arrIndex;
        rowData['innerObject'] = innerObject;
        rowData['innerArrIndex'] = innerArrIndex;
        rowData['property'] = property;
        rowData['checked'] = false;

        var td1 = document.createElement('td');
        var td2 = document.createElement('td');
        var td3 = document.createElement('td');
        var td4 = document.createElement('td');

        var t1 = document.createElement('input');
        t1.type = 'checkbox';
        t1.onchange = function () {
            if (this.checked) {
                rowData['checked'] = true;
            }
            else {
                rowData['checked'] = false;
            }

        }

        tr.data = rowData;

        var t2 = document.createTextNode(elementId);
        var t3 = document.createTextNode(propertyName);
        var t4 = document.createTextNode(string);

        td1.appendChild(t1);
        td2.appendChild(t2);
        td3.appendChild(t3);
        td4.appendChild(t4);

        tr.appendChild(td1);
        tr.appendChild(td2);
        tr.appendChild(td3);
        tr.appendChild(td4);


        table.appendChild(tr);
    }



    body.id = 'body';

    div.appendChild(query);
    div.appendChild(actions);
    div.appendChild(seperator);
    div.appendChild(body);

    //-----------------------------------------------------
    AddButtonContainer(div,
        function () {
            ui.hideDialog(true);
        },
        function () {
            ui.hideDialog(true);
        });
    //-----------------------------------------------------

    this.container = div;
}
