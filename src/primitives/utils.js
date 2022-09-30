/** @license
Cpu-Audio: an extension to the hash system to address timecode into audio/video elements and a player WebComponent
Version 7.1pre
Copyright (C) 2014-2022 Xavier "dascritch" Mouton-Dubosc & contributors.
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

