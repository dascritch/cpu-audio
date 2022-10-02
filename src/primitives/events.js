import { absolutizeUrl } from './filters.js';

// Parameters for addEventListener
// @private
export const passiveEvent = { passive: true };
// @private
export const oncePassiveEvent = { ...passiveEvent, once: true };


/**
 * @summary Will prevent a link in a page if linked to the same absolute URL
 *
 * @param      {Event}  event   The event
 */
function preventLinkToSamePage(event) {
	if (absolutizeUrl(window.location.href) === absolutizeUrl(event.target.href)) {
		event.preventDefault();
	}
}

/**
 * @summary Cancel any action on this link if its href is in this page
 *
 * @param      {Element}  element  The <A> DOM element
 */
export function preventLinkOnSamePage(element) {
	element.addEventListener('click', preventLinkToSamePage);
}
