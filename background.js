const couplings = { /* [tabid]: Coupling */ };

function getOrCreate(tab) {
    if (!couplings[tab]) {
        couplings[tab] = new Coupling();
    }
    return couplings[tab];
}

function isNumeric(str) {
    return +str + '' === str;
}

chrome.runtime.onConnect.addListener(port => {
    if (isNumeric(port.name)) {
        /* devtools */
        getOrCreate(port.name).assignDevTools(port);
    } else {
        /* page backend */
        getOrCreate(port.sender.tab.id).assignContentScript(port);
    }
});

/**
 * Pairs the connection from a tab content-script to the connection
 * from the devtools panel.
 */
function Coupling() {
    /* content script port */
    let cs = null;
    /* devtools port */
    let dt = null;

    this.assignDevTools =
        (port) => {
            dt = port;
            port.onMessage.addListener(toLeft);
            port.onDisconnect.addListener(dtDisconnect);
            console.log('dt connected');
        }

    this.assignContentScript =
        (port) => {
            cs = port;
            port.onMessage.addListener(toRight);
            port.onDisconnect.addListener(csDisconnect);
            console.log('cs connected');
        }

    function toRight(message) {
        if (!dt) { return; }
        console.log('cs -> dt', message);
        dt.postMessage(message)
    }

    function toLeft(message) {
        if (!cs) { return; }
        console.log('cs <- dt', message)
        cs.postMessage(message)
    }

    function csDisconnect(message) {
        console.log('cs disconnect');
        cs.onMessage.removeListener(toLeft);
        cs.onDisconnect.removeListener(csDisconnect);
        cs = null;
    }

    function dtDisconnect(message) {
        console.log('dt disconnect');
        dt.onMessage.removeListener(toLeft);
        dt.onDisconnect.removeListener(dtDisconnect);
        dt = null;
    }
}
