/**
 * Function to install on inspected tabs
 */
function installHook(window) {
    function onWindowMessage(e) {
        if (e.data.source === 'devtools-cs') {
            console.info(e.data.payload);
        }
    };

    function sendMessage(payload) {
        window.postMessage({
            source: 'devtools-hook', payload
        }, '*');
    };

    const hookName = '__TOOLS_HOOK__';
    if (window.hasOwnProperty(hookName)) { return; }

    const hook = {
        init() { window.addEventListener('message', onWindowMessage); },
        /* sends a message to devtools */
        ping() { sendMessage('ping'); }
    };

    /* expose the hook on the window object in the page */
    Object.defineProperty(window, hookName, {
        get () { return hook; }
    });
    
    hook.init();
}

/* Inject the hook */
function injectHook () {
    chrome.devtools.inspectedWindow.eval(
        ';(' + installHook.toString() + ')(window)');
}

/**
 * Wait for the hook to initialize and
 * then create the devtools panel
 */
function waitForHook () {
    let checkCount = 0;
    let created = false;
    let interval;

    function wait() {
        if (checkCount++ > 10) {
            clearInterval(interval);
        }
        chrome.devtools.inspectedWindow.eval(
            '!!(window.__TOOLS_HOOK__)', (hasHook) => {
            if (!hasHook || created) { return; }
            clearInterval(interval);
            created = true;
            chrome.devtools.panels.create('ping-pong', null,
                'devtools-panel.html', panel => {});
        });
    }
    wait();
    interval = setInterval(wait, 1000);
}

/* Inject and wait */
injectHook();
waitForHook();

/* reinject the hook when the page navigates */
chrome.devtools.network.onNavigated.addListener(() => {
    injectHook();
    waitForHook();
});

