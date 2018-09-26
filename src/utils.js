function onDebug(callback_fx) {
    // this is needed for testing, as we now run in async tests
    if (typeof callback_fx === 'function') {
        callback_fx();
    }
}

function querySelector_apply(selector, callback, subtree) {
    subtree = subtree === undefined ? document : subtree;
    Array.from(subtree.querySelectorAll(selector)).forEach(callback);
}

function is_decent_browser_for_webcomponents() {
    return window.customElements !== undefined;
}


function absolutize_url(url) {
    let test_element = document.createElement('a');
    test_element.href = typeof url !== 'string' ? url : url.split('#')[0];
    return test_element.href;
}

function not_screen_context() {
    return !window.matchMedia("screen").matches;
}

function prevent_link_on_same_page(event) {
    if (absolutize_url(window.location.href) !== absolutize_url(event.target.href)) {
        return ;
    }
    event.preventDefault();
}

function element_prevent_link_on_same_page(element) {
    element.addEventListener('click', prevent_link_on_same_page);
}

function _isEvent(event) {
    // is this event really triggered via a native event ?
    return event.preventDefault !== undefined;
}