/* Connect to the backend */
var port = chrome.extension.connect({
    name: '' + chrome.devtools.inspectedWindow.tabId
});

/* Listen for pings */
port.onMessage.addListener(function (message) {
    var el = document.createElement('div');
    el.innerText = JSON.stringify(message);
    document.body.appendChild(el);

    if (message === 'ping') {
        port.postMessage('pong');
    }
});