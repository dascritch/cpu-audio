import { findCPU } from './primitives/utils.js';
import { passiveEvent, oncePassiveEvent, preventLinkOnSamePage } from './primitives/events.js';
import { audiotagPreloadMetadata } from './mediatag/extension.js';

import timebar_finger_manager from './component/timebar_finger_manager.js';
import { acceptable_press_actions, finenav_finger_manager } from './component/finenav_finger_manager.js';

import trigger from './trigger.js';
import {buildChaptersLoader} from './build_chapters.js';
import {buildPlaylist} from './build_playlist.js';

/**
 * @summary Interprets `navigator.share` native API
 *
 * @param      {Object}  event   Activation event
 */
function nativeShare(event) {
	const {title, canonical} = findCPU(event.target).audiotagDataset();
	navigator.share({
		title,
		text	: title,
		url 	: canonical
	});
	event.preventDefault();
}


/**
 * @private, because at start
 *
 * @param      {Object}  			elCPU  <cpu-audio>.CPU
 *
 * @summary Builds the controller.
 */
export function buildInterface(elCPU) {
	// #interface SHOULD have a tabindex="-1" attribute. This is mandatory for getting keyboard browsing. Any attempt to give it focus will focus #control or #toggleplay instead. 
	elCPU.container.addEventListener('focus', (event) => {
		(elCPU.shadowId('control') ?? elCPU.shadowId('toggleplay'))?.focus();
		event.preventDefault();
	});

	const { classList } = elCPU.container;

	// hide broken image while not loaded
	elCPU.shadowId('poster')?.addEventListener('load', () => {
		classList.add('poster-loaded');
	}, passiveEvent);

	// main buttons management
	const cliquables = {
		pause      : trigger.pause,
		play       : trigger.play,
		time       : trigger.throbble,
		actions    : () => {elCPU.showActions();},
		back       : (event) => {elCPU.showMain(); event.preventDefault();},
		poster     : () => {elCPU.showMain();},
		restart    : trigger.restart,
		toggleplay : trigger.toggleplay,
		prevcue    : trigger.prevcue,
		nextcue    : trigger.nextcue,
		prevtrack  : trigger.prevtrack,
		nexttrack  : trigger.nexttrack,
	};
	for (const [elementId, elementAction] of Object.entries(cliquables)) {
		const el = elCPU.shadowId(elementId);
		el?.addEventListener('click', elementAction, el.tagName === 'A' ? {} : passiveEvent);
	}

	// relative browsing buttons management
	//  *ward : handheld nav to allow long press to repeat action
	for (const elementId of acceptable_press_actions) {
		const button_element = elCPU.shadowId(elementId);
		button_element?.addEventListener('pointerdown', finenav_finger_manager.press);
		button_element?.addEventListener('pointerout', finenav_finger_manager.release);
		button_element?.addEventListener('pointerup', finenav_finger_manager.release);
	}

	// keyboard management
	elCPU.element.addEventListener('keydown', trigger.key);

	// throbber management
	const timeline_element = elCPU.shadowId('time');
	timeline_element?.addEventListener('pointerenter', trigger.hover, passiveEvent);
	timeline_element?.addEventListener('pointermove', trigger.hover, passiveEvent);
	timeline_element?.addEventListener('pointerout', trigger.out, passiveEvent);
	timeline_element?.addEventListener('pointerdown', timebar_finger_manager.down, passiveEvent);
	timeline_element?.addEventListener('pointerup', timebar_finger_manager.up, passiveEvent);

	if (navigator.share) {
		classList.add('hasnativeshare');
		elCPU.shadowId('nativeshare')?.addEventListener('click', nativeShare, passiveEvent);
	}

	const canonical_element = elCPU.shadowId('canonical'); 
	if (canonical_element) {
		preventLinkOnSamePage( canonical_element );
	}

	if (!elCPU.audiotag)  {
		// <cpu-controller> without <cpu-audio> , see https://github.com/dascritch/cpu-audio/issues/91
		return;
	}

	elCPU.container.addEventListener('pointerenter', () => { 
		audiotagPreloadMetadata(elCPU.audiotag);
	}, oncePassiveEvent);

	elCPU.audiotag.addEventListener('durationchange', () => {elCPU.repositionTracks(); }, passiveEvent);

	buildChaptersLoader(elCPU);
	buildPlaylist();
	elCPU.showMain();
	elCPU.updatePlayButton();
	elCPU.emitEvent('ready');

	elCPU.updateLinks();

}

export default buildInterface;