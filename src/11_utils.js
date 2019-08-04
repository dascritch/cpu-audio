/**
 * If run in debug context, launch a function for calback
 *
 * @param      {Function|null|undefined}  callback_fx  The function to call
 */
function onDebug(callback_fx) { 
	// may be used as a noop(); 
	if (typeof callback_fx === 'function') {
		// this is needed for testing, as we now run in async tests
		callback_fx();
	}
}

/**
 * Process a function on each matched CSS selector found in a DOM tree
 *
 * @param      {string}                selector             The css selector
 * @param      {Function}              callback             The callback function, its 1st parameter will be the matching DOM element
 * @param      {Element|HTMLDocument|ShadowRoot}  [subtree=undefined]  The subtree, by default the whole hosting document
 */
function querySelector_apply(selector, callback, subtree=undefined) {
	subtree = subtree === undefined ? document : subtree;
	Array.from(
		subtree.querySelectorAll(selector)
		).forEach(callback);
}

/**
 * Determines if the hosting browser can use webcomponents.
 *
 * @return     {boolean}  True if decent browser for webcomponents, False otherwise.
 */
function is_decent_browser_for_webcomponents() {
	return window.customElements !== undefined;
}

/**
 * Transform a possibily relative URL to an absolute URL, including server name
 *
 * @param      {string}  url     The url
 * @return     {string}  url     Absolute url
 */
function absolutize_url(url) {
	let test_element = document.createElement('a');
	test_element.href = (typeof url !== 'string') ? url : url.split('#')[0];
	return test_element.href;
}

/**
 * Checks if we are in a screen context, and not a vocal or braille interface
 *
 * @return     {boolean}  False if have a screen
 */
function not_screen_context() {
	return !window.matchMedia("screen").matches;
}

/**
 * Will prevent a link in a page if linked to the same absolute URL
 *
 * @param      {Object}  event   The event
 */
function prevent_link_on_same_page(event) {
	if (absolutize_url(window.location.href) !== absolutize_url(event.target.href)) {
		return ;
	}
	event.preventDefault();
}

/**
 * Cancel any action on this link if its href is in this page
 *
 * @param      {Element}  element  The <A> DOM element
 */
function element_prevent_link_on_same_page(element) {
	element.addEventListener('click', prevent_link_on_same_page);
}

/**
 * Determines if event is really an event, and not a faked one
 *
 * @param      {Object}   event   The supposed event
 * @return     {boolean}  True if event, False otherwise.
 */
function _isEvent(event) {
	// is this event really triggered via a native event ?
	return event.preventDefault !== undefined;
}

/**
 * Escape a text. Will truly escape HTML tags and entities. No hazardous regexes or replaces
 *
 * @param      {string}  text    The text
 * @return     {string}  HTML escaped text
 */
function escapeHTML(text) {
	let burn_after_reading = document.createElement('span');
	burn_after_reading.innerText = text;
	let out = burn_after_reading.innerHTML;
	burn_after_reading.remove();
	return out;
}


/**
 * Shortcut for console info
 *
 * @param      {string}  message  The message
 */
function info(message) {
	window.console.info(`${CpuAudioTagName}: `,message);
}

/**
 * Shortcut for console warning
 *
 * @param      {string}  message  The message
 */
function warn(message) {
	window.console.warn(`${CpuAudioTagName}: `,message);
}

/**
 * Shortcut for console error
 *
 * @param      {string}  message  The message
 */
function error(message) {
	window.console.error(`${CpuAudioTagName}: `,message);
}