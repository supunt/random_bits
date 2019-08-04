generalAlert = function()
{

}

AlertMsg = function (message, callback, headerLbl = 'Alert') {
    if (message == null || message.trim() == '')
        return;

    var alertBox = document.getElementById('alertContainer');

    if (alertBox)
    {
        if (alertBox.style.display == 'block') {

            if (alertBox.AlertType && alertBox.AlertType > 0)
                return;

            alertBox.style.display = 'none';
            alertBox.removeChild(alertBox.children[0]);
        }

        alertBox['AlertType'] = 0;

        var container = document.createElement('div');
        container.className = 'msg-content justify-content-center';

        var imageBox = document.createElement('div');
        var image = document.createElement('img');
        image.src = "/images/msgOk.png";
        imageBox.appendChild(image);
        container.appendChild(imageBox);

        var header = document.createElement('div');
        header.className = 'msg-header';
        header.innerHTML = headerLbl;
        container.appendChild(header);

        var msg = document.createElement('div');
        msg.className = 'msg-body';
        msg.innerHTML = message;

        container.appendChild(msg);

        var footer = document.createElement('div');
        footer.className = 'msg-footer';

        var btnContainer = document.createElement('div');

        var btnok = document.createElement('input');
        btnok.type = 'button';
        btnok.className = 'msg-footer-btn';
        btnok.value = 'Ok';
        btnok.onclick = function ()
        {
            alertBox.style.display = 'none';
            alertBox.removeChild(container);
            if (callback)
                callback();
        }; 

        btnContainer.appendChild(btnok);
        footer.appendChild(btnContainer);

        container.appendChild(footer);

        alertBox.appendChild(container);

        alertBox.style.display = 'block';
    }
    
}

AlertOkCancel = function (message, okCallback, cancelCallback, headerLbl = 'Alert', okLabel = 'Ok', cancelLabel = 'Cancel') {
    if (message == null || message.trim() == '')
        return;

    var alertBox = document.getElementById('alertContainer');

    if (alertBox) {
        if (alertBox.style.display == 'block') {

            if (alertBox.AlertType && alertBox.AlertType > 0)
                return;

            alertBox.style.display = 'none';
            alertBox.removeChild(alertBox.children[0]);
        }

        alertBox['AlertType'] = 0;

        var container = document.createElement('div');
        container.className = 'msg-content';

        var imageBox = document.createElement('div');
        imageBox.style.textAlign = 'center';
        var image = document.createElement('img');
        image.src = "/images/msgOk.png";
        imageBox.appendChild(image);
        container.appendChild(imageBox);

        var header = document.createElement('div');
        header.className = 'msg-header';
        header.innerHTML = headerLbl;
        container.appendChild(header);

        var msg = document.createElement('div');
        msg.className = 'msg-body';
        msg.innerHTML = message;

        container.appendChild(msg);

        var footer = document.createElement('div');
        footer.className = 'msg-footer';

        var btnContainer = document.createElement('div');

        var btnok = document.createElement('input');
        btnok.type = 'button';
        btnok.className = 'msg-footer-btn';
        btnok.value = okLabel;
        btnok.onclick = function () {
            alertBox.style.display = 'none';
            alertBox.removeChild(container);
            if (okCallback)
                okCallback();
        };

        var btnCancel = document.createElement('input');
        btnCancel.type = 'button';
        btnCancel.className = 'msg-footer-btn';
        btnCancel.value = cancelLabel;
        btnCancel.onclick = function () {
            alertBox.style.display = 'none';
            alertBox.removeChild(container);
            if (cancelCallback)
                cancelCallback();
        };

        btnContainer.appendChild(btnok);
        btnContainer.appendChild(btnCancel);
        footer.appendChild(btnContainer);

        container.appendChild(footer);

        alertBox.appendChild(container);

        alertBox.style.display = 'block';
    }
}

WarningMsg = function (message, callback, headerLbl = 'Warning') {
    if (message == null || message.trim() == '')
        return;

    var alertBox = document.getElementById('alertContainer');
    if (alertBox) {

        if (alertBox.style.display == 'block') {

            if (alertBox.AlertType && alertBox.AlertType > 1)
                return;

            alertBox.style.display = 'none';
            alertBox.removeChild(alertBox.children[0]);
        }

        alertBox['AlertType'] = 1;

        var container = document.createElement('div');
        container.className = 'msg-content';

        var imageBox = document.createElement('div');
        imageBox.style.textAlign = 'center';
        var image = document.createElement('img');
        image.src = "/images/msgwarn.png";
        imageBox.appendChild(image);
        container.appendChild(imageBox);

        var header = document.createElement('div');
        header.className = 'msg-header-warning';
        header.innerHTML = headerLbl;
        container.appendChild(header);

        var msg = document.createElement('div');
        msg.className = 'msg-body';
        msg.innerHTML = message;

        container.appendChild(msg);

        var footer = document.createElement('div');
        footer.className = 'msg-footer';

        var btnContainer = document.createElement('div');

        var btnok = document.createElement('input');
        btnok.type = 'button';
        btnok.className = 'msg-footer-btn';
        btnok.value = 'Ok';
        btnok.onclick = function () {
            alertBox.style.display = 'none';
            alertBox.removeChild(container);
            if (callback)
                callback();
        };

        btnContainer.appendChild(btnok);
        footer.appendChild(btnContainer);

        container.appendChild(footer);

        alertBox.appendChild(container);

        alertBox.style.display = 'block';
    }
}

WarningOkCancel = function (message, okCallback, cancelCallback, headerLbl = 'Warning', okLabel = 'Ok', cancelLabel = 'Cancel') {
    if (message == null || message.trim() == '')
        return;

    var alertBox = document.getElementById('alertContainer');
    if (alertBox) {

        if (alertBox.style.display == 'block') {

            if (alertBox.AlertType && alertBox.AlertType > 1)
                return;

            alertBox.style.display = 'none';
            alertBox.removeChild(alertBox.children[0]);
        }

        alertBox['AlertType'] = 1;

        var container = document.createElement('div');
        container.className = 'msg-content';

        var imageBox = document.createElement('div');
        imageBox.style.textAlign = 'center';
        var image = document.createElement('img');
        image.src = "/images/msgwarn.png";
        imageBox.appendChild(image);
        container.appendChild(imageBox);

        var header = document.createElement('div');
        header.className = 'msg-header-warning';
        header.innerHTML = headerLbl;
        container.appendChild(header);

        var msg = document.createElement('div');
        msg.className = 'msg-body';
        msg.innerHTML = message;

        container.appendChild(msg);

        var footer = document.createElement('div');
        footer.className = 'msg-footer';

        var btnContainer = document.createElement('div');

        var btnok = document.createElement('input');
        btnok.type = 'button';
        btnok.className = 'msg-footer-btn';
        btnok.value = okLabel;
        btnok.onclick = function () {
            alertBox.style.display = 'none';
            alertBox.removeChild(container);
            if (okCallback)
                okCallback();
        };

        var btnCancel = document.createElement('input');
        btnCancel.type = 'button';
        btnCancel.className = 'msg-footer-btn';
        btnCancel.value = cancelLabel;
        btnCancel.onclick = function () {
            alertBox.style.display = 'none';
            alertBox.removeChild(container);
            if (cancelCallback)
                cancelCallback();
        };

        btnContainer.appendChild(btnok);
        btnContainer.appendChild(btnCancel);

        footer.appendChild(btnContainer);

        container.appendChild(footer);

        alertBox.appendChild(container);

        alertBox.style.display = 'block';
    }
}

ErrorMsg = function (message, callback, headerLbl = 'Error') {
    if (message == null || message.trim() == '')
        return;

    var alertBox = document.getElementById('alertContainer');
    if (alertBox) {

        // Display anyway, this is error and high priority
        if (alertBox.style.display == 'block') {
            alertBox.style.display = 'none';
            alertBox.removeChild(alertBox.children[0]);
        }

        alertBox['AlertType'] = 2;

        var container = document.createElement('div');
        container.className = 'msg-content';

        var imageBox = document.createElement('div');
        imageBox.style.textAlign = 'center';
        var image = document.createElement('img');
        image.src = "/images/msgError.png";
        imageBox.appendChild(image);
        container.appendChild(imageBox);

        var header = document.createElement('div');
        header.className = 'msg-header-error';
        header.innerHTML = headerLbl;
        container.appendChild(header);

        var msg = document.createElement('div');
        msg.className = 'msg-body';
        msg.innerHTML = message;

        container.appendChild(msg);

        var footer = document.createElement('div');
        footer.className = 'msg-footer';

        var btnContainer = document.createElement('div');

        var btnok = document.createElement('input');
        btnok.type = 'button';
        btnok.value = 'Ok';
        btnok.className = 'msg-footer-btn';

        btnok.onclick = function () {
            alertBox.style.display = 'none';
            alertBox.removeChild(container);
            if (callback)
                callback();
        };

        btnContainer.appendChild(btnok);
        footer.appendChild(btnContainer);

        container.appendChild(footer);

        alertBox.appendChild(container);

        alertBox.style.display = 'block';
    }
}

ErrorOkCancel = function (okCallback, cancelCallback) {

}

PromptOkCancel = function (message, okCallback, cancelCallback, headerLbl = 'Alert', okLabel = 'Ok', cancelLabel = 'Cancel') {
    if (message == null || message.trim() == '')
        return;

    var alertBox = document.getElementById('alertContainer');

    if (alertBox) {
        if (alertBox.style.display == 'block') {

            if (alertBox.AlertType && alertBox.AlertType > 0)
                return;

            alertBox.style.display = 'none';
            alertBox.removeChild(alertBox.children[0]);
        }

        alertBox['AlertType'] = 0;

        var container = document.createElement('div');
        container.className = 'msg-content';

        var header = document.createElement('div');
        header.className = 'msg-header';
        header.innerHTML = headerLbl;
        container.appendChild(header);

        var msg = document.createElement('div');
        msg.className = 'msg-body';
        msg.innerHTML = message;

        var inputEntry = document.createElement('input');
        inputEntry.style.cssFloat = 'right';
        
        msg.appendChild(inputEntry);

        container.appendChild(msg);

        var footer = document.createElement('div');
        footer.className = 'msg-footer';

        var btnContainer = document.createElement('div');

        var btnok = document.createElement('input');
        btnok.type = 'button';
        btnok.disabled = true;
        btnok.className = 'msg-footer-btn-disabled';
        btnok.value = okLabel;
        btnok.onclick = function () {
            if (inputEntry.value.trim() == '') {
                return;
            }

            alertBox.style.display = 'none';
            alertBox.removeChild(container);
            if (okCallback)
                okCallback(inputEntry.value);
        };

        inputEntry.onchange = function () {
            if (inputEntry.value.trim() != '') {
                btnok.disabled = false;
                btnok.className = 'msg-footer-btn';
            }
            else {
                btnok.disabled = true;
                btnok.className = 'msg-footer-btn-disabled';
            }
        }

        var btnCancel = document.createElement('input');
        btnCancel.type = 'button';
        btnCancel.className = 'msg-footer-btn';
        btnCancel.value = cancelLabel;
        btnCancel.onclick = function () {
            alertBox.style.display = 'none';
            alertBox.removeChild(container);
            if (cancelCallback)
                cancelCallback();
        };

        btnContainer.appendChild(btnok);
        btnContainer.appendChild(btnCancel);
        footer.appendChild(btnContainer);

        container.appendChild(footer);

        alertBox.appendChild(container);
    }
}