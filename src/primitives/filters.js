/**
 * @summary Escape a text. Will truly escape HTML tags and entities. No hazardous regexes or replaces
 *
 * @param      {string}  text    The text
 * @return     {string}  HTML escaped text
 */
export function escapeHtml(text) {
	const burn_after_reading = document.createElement('p');
	burn_after_reading.innerText = text;
	const { innerHTML } = burn_after_reading;
	// burn_after_reading.remove(); implicit
	return innerHTML;
}

/**
 * @summary Remove HTML elements and entities from a text.
 *
 * @param      {string}  html    HTML source
 * @return     {string}  text
 */
export function removeHtml(html) {
	const burn_after_reading = document.createElement('p');
	burn_after_reading.innerHTML = html;
	const { innerText } = burn_after_reading;
	// burn_after_reading.remove(); implicit
	return innerText;
}

/**
 * @summary Transform a possibily relative URL to an absolute URL, including server name, but removing hash part
 *
 * @param      {string}  url     The url
 * @return     {string}  url     Absolute url
 */
export function absolutizeUrl(url) {
	const test_element = document.createElement('a');
	test_element.href = (typeof url !== 'string') ? url : url.split('#')[0];
	return test_element.href;
}