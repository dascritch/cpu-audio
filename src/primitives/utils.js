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

import { absolutizeUrl } from './filters.js';

export const CpuAudioTagName = 'CPU-AUDIO';
export const CpuControllerTagName = 'CPU-CONTROLLER';
export const selectorAcceptable = 'audio[controls]';
export const selectorAudioInComponent = `${CpuAudioTagName} audio`; // should be 'audio[controls]' but PHRACK APPLE !

// Parameters for addEventListener
// @private
export const passiveEvent = { passive: true };
// @private
export const oncePassiveEvent = { ...passiveEvent, once: true };

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

