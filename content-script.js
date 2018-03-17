(function contentScript() {
    /* sends a message to the hook */
    function postMessageToHook(payload) {
        window.postMessage({source: 'devtools-cs', payload: payload}, '*');
    }

    /* sends a message to the background page */
    function onHookMessage(e) {
        if (e.data && e.data.source === 'devtools-hook')
            port.postMessage(e.data.payload);
    }

    /* handle the background page disconnecting */
    function onPortDisconnect() {
        window.removeEventListener('message', onHookMessage);
    }

    const port = chrome.runtime.connect({name: 'content-script'});
    port.onMessage.addListener(postMessageToHook);
    port.onDisconnect.addListener(onPortDisconnect);
    window.addEventListener('message', onHookMessage);
})();
