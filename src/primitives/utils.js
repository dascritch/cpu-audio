/** @license
Cpu-Audio: an extension to the hash system to address timecode into audio/video elements and a player WebComponent
Version 7.1pre
Copyright (C) 2014-2021 Xavier "dascritch" Mouton-Dubosc & contributors.
License LGPL 3

- project mini-site https://dascritch.github.io/cpu-audio/
- project repository : https://github.com/dascritch/cpu-audio
- use case : http://cpu.pm
- blog post : https://dascritch.net/post/2018/11/06/Reconstruire-son-lecteur-audio-pour-le-web
**/

export const CpuAudioTagName = 'CPU-AUDIO';
export const CpuControllerTagName = 'CPU-CONTROLLER';
export const selectorAcceptable = 'audio[controls]';
export const selectorAudioInComponent = `${CpuAudioTagName} audio`; // should be 'audio[controls]' but PHRACK APPLE !

// Parameters for addEventListener
// @private
export const passiveEvent = {passive: true};
// @private
export const oncePassiveEvent = {passive: true, once: true};

// private,to add attributes for unnamed <audio> , will be superseeded with #186 
// @private
export const dynamicallyAllocatedIdPrefix = 'CPU-Audio-tag-';

/**
 * @summary Process a function on each matched CSS selector found in a DOM tree
 *
 * @param      {string}                selector             The css selector
 * @param      {Function}              callback             The callback function, its 1st parameter will be the matching DOM element
 * @param      {Element|HTMLDocument|ShadowRoot}  [subtree=document]  The subtree, by default the whole hosting document
 */
export function querySelectorDo(selector, callback, subtree=document) {
	Array.from(
		subtree.querySelectorAll(selector)
	).forEach(callback);
}

/**
 * @summary Find adjacent key to a key in object, previous or next one
 * @public via document.CPU for tests purposes
 *
 * @param      	{object}              	object    	Object to analyze
 * @param       string 					key 		Key where to position
 * @param       number 					offset 		offset to reposition. -1 for previous, +1 for next
 * @return    	string|null|undefined          		found key, null or undefined if inapplicable
 */
export function adjacentKey(obj, key, offset) {
	if (!obj?.hasOwnProperty) {
		return null;
	}
	const keys = Object.keys(obj);
	return keys[keys.indexOf(key) + offset];
}

/**
 * @summary Find adjacent value to a value in an array, previous or next one
 *
 * @param      	array              		array    	Array to analyse
 * @param       string 					value 		Value where to position
 * @param       number 					offset 		offset to reposition. -1 for previous, +1 for next
 * @return    	string|null|undefined          		found key, null or undefined if inapplicable
 */
export function adjacentArrayValue(arr, value, offset) {
	if (!arr?.indexOf) {
		return null;
	}
	const index = arr.indexOf(value);
	if (index === -1) {
		return null;
	}
	return arr[index + offset];
}


/**
 * Determines if the hosting browser can use webcomponents.
 */
export const browserIsDecent = window.customElements !== undefined;

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

/**
 * @summary Checks if we are in a screen context, and not a vocal or braille interface
 *
 * @return     {boolean}  False if have a screen
 */
export function notScreenContext() {
	return !window.matchMedia('screen').matches;
}

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
 * @summary For any <audio> tag or its child tag or shadowDOM element, returns the element `CPU` API
 * @public via document.CPU.findCPU
 *
 * @param      {Element}  child   The child
 * @return     {CPU_element_api}       Element.CPU
 */
export function findCPU(child) {
	if ([CpuAudioTagName, CpuControllerTagName].includes(child.tagName)) {
		return child.CPU;
	}

	let closest_cpuaudio = child.closest(CpuAudioTagName) ?? child.closest(CpuControllerTagName);
	if (closest_cpuaudio) {
		return closest_cpuaudio.CPU;
	}

	return child.getRootNode().host.CPU;
}


/**
 * @summary Shortcut for console info
 *
 * @param      {string}  message  The message
 */
export const info = (message) => window.console.info(`${CpuAudioTagName}: `,message);

/**
 * @summary Shortcut for console warning
 *
 * @param      {string}  message  The message
 */
export const warn = (message) => window.console.warn(`${CpuAudioTagName}: `,message);

/**
 * @summary Shortcut for console error
 *
 * @param      {string}  message  The message
 */
export const error = (message) => window.console.error(`${CpuAudioTagName}: `,message);

