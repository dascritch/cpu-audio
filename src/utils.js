/** @license
Cpu-Audio: an extension to the hash system to address timecode into audio/video elements and a player WebComponent
Version 6.7pre
Copyright (C) 2014-2021 Xavier "dascritch" Mouton-Dubosc & contributors.
License GNU GPL 3

- project mini-site https://dascritch.github.io/cpu-audio/
- project repository : https://github.com/dascritch/cpu-audio
- use case : http://cpu.pm
- blog post : https://dascritch.net/post/2018/11/06/Reconstruire-son-lecteur-audio-pour-le-web
**/

export const CpuAudioTagName = 'CPU-AUDIO';
export const CpuControllerTagName = 'CPU-CONTROLLER';
export const selector_interface = '#interface';
export const acceptable_selector = 'audio[controls]';
export const selector_audio_in_component = 'cpu-audio audio'; // should be 'audio[controls]' but PHRACK APPLE !

// Parameters for addEventListener
// @private
export const passive_ev = {passive: true};
// @private
export const once_passive_ev = {passive: true, once: true};

// private,to add attributes for unnamed <audio>
// @private
export const dynamically_allocated_id_prefix = 'CPU-Audio-tag-';

/**
 * @summary Process a function on each matched CSS selector found in a DOM tree
 *
 * @param      {string}                selector             The css selector
 * @param      {Function}              callback             The callback function, its 1st parameter will be the matching DOM element
 * @param      {Element|HTMLDocument|ShadowRoot}  [subtree=document]  The subtree, by default the whole hosting document
 */
export function querySelector_apply(selector, callback, subtree=document) {
	Array.from(
		subtree.querySelectorAll(selector)
	).forEach(callback);
}

/**
 * @summary Determines if the hosting browser can use webcomponents.
 *
 * @return     {boolean}  True if decent browser for webcomponents, False otherwise.
 */
export function is_decent_browser_for_webcomponents() {
	return window.customElements !== undefined;
}

/**
 * @summary Transform a possibily relative URL to an absolute URL, including server name, but removing hash part
 *
 * @param      {string}  url     The url
 * @return     {string}  url     Absolute url
 */
export function absolutize_url(url) {
	let test_element = document.createElement('a');
	test_element.href = (typeof url !== 'string') ? url : url.split('#')[0];
	return test_element.href;
}

/**
 * @summary Checks if we are in a screen context, and not a vocal or braille interface
 *
 * @return     {boolean}  False if have a screen
 */
export function not_screen_context() {
	return !window.matchMedia('screen').matches;
}

/**
 * @summary Will prevent a link in a page if linked to the same absolute URL
 *
 * @param      {Event}  event   The event
 */
function prevent_link_on_same_page(event) {
	if (absolutize_url(window.location.href) === absolutize_url(event.target.href)) {
		event.preventDefault();
	}
}

/**
 * @summary Cancel any action on this link if its href is in this page
 *
 * @param      {Element}  element  The <A> DOM element
 */
export function element_prevent_link_on_same_page(element) {
	element.addEventListener('click', prevent_link_on_same_page);
}

/**
 * @summary Escape a text. Will truly escape HTML tags and entities. No hazardous regexes or replaces
 *
 * @param      {string}  text    The text
 * @return     {string}  HTML escaped text
 */
export function escape_html(text) {
	let burn_after_reading = document.createElement('span');
	burn_after_reading.innerText = text;
	let out = burn_after_reading.innerHTML;
	burn_after_reading.remove();
	return out;
}

/**
 * @summary check if an element.id is cited in hash url
 *
 * @param      {string}   id      element id to check
 * @return     {boolean}  is in hash
 * /
function id_in_hash(id) {
	return location.hash.substr(1).split('&').includes(id);
}*/


/**
 * @summary For any ShadowDOM element, will returns its parent interface container
 * @public via document.CPU.findInterface
 *
 * @param      {Element}  child   The ShadowDOM child
 * @return     {Element}  The #interface element
 */
export function findInterface(child) {
	return child.closest(selector_interface);
}

/**
 * @summary For any <audio> tag or its child tag or shadowDOM element, returns the element `CPU` API
 * @public via document.CPU.findContainer
 *
 * @param      {Element}  child   The child
 * @return     {CPU_element_api}       Element.CPU
 */
export function findContainer(child) {
	if ([CpuAudioTagName, CpuControllerTagName].includes(child.tagName)) {
		return child.CPU;
	}

	let closest_cpuaudio = child.closest(CpuAudioTagName);
	if (closest_cpuaudio) {
		return closest_cpuaudio.CPU;
	}

	return findInterface(child).parentNode.host.CPU;
}


/**
 * @summary Shortcut for console info
 *
 * @param      {string}  message  The message
 */
export function info(message) {
	window.console.info(`${CpuAudioTagName}: `,message);
}

/**
 * @summary Shortcut for console warning
 *
 * @param      {string}  message  The message
 */
export function warn(message) {
	window.console.warn(`${CpuAudioTagName}: `,message);
}

/**
 * @summary Shortcut for console error
 *
 * @param      {string}  message  The message
 */
export function error(message) {
	window.console.error(`${CpuAudioTagName}: `,message);
}
