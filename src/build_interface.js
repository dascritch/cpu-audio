import {passiveEvent, oncePassiveEvent, findCPU, preventLinkOnSamePage} from './utils.js';
import {trigger} from './trigger.js';
import {audiotagPreloadMetadata} from './media_element_extension.js';
import {pressManager} from './finger_manager.js';
import {buildChaptersLoader} from './build_chapters.js';
import {buildPlaylist} from './build_playlist.js';

/**
 * @summary Interprets `navigator.share` native API
 *
 * @param      {Object}  event   The event
 */
function nativeShare(event) {
	let {title, canonical} = findCPU(event.target).audiotagDataset();
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
	const interface_classlist = elCPU.shadowId('interface').classList;

	// hide broken image while not loaded
	elCPU.shadowId('poster')?.addEventListener('load', () => {
		interface_classlist.add('poster-loaded');
	}, passiveEvent);

	// main buttons management
	let cliquables = {
		pause      : trigger.pause,
		play       : trigger.play,
		time       : trigger.throbble,
		actions    : () => {elCPU.showActions();},
		back       : () => {elCPU.showMain();},
		poster     : () => {elCPU.showMain();},
		restart    : trigger.restart,
		toggleplay : trigger.toggleplay,
		prevcue    : trigger.prevcue,
		nextcue    : trigger.nextcue,
		prevtrack  : trigger.prevtrack,
		nexttrack  : trigger.nexttrack,
	};
	for (let elementId in cliquables) {
		elCPU.shadowId(elementId)?.addEventListener('click', cliquables[elementId], passiveEvent);
	}

	// relative browsing buttons management
	//  *ward : handheld nav to allow long press to repeat action
	const _buttons = ['fastreward', 'reward', 'foward', 'fastfoward'];
	for (let elementId of _buttons) {
		const button_element = elCPU.shadowId(elementId);
		button_element?.addEventListener('pointerdown', pressManager.press);
		button_element?.addEventListener('pointerout', pressManager.release);
		button_element?.addEventListener('pointerup', pressManager.release);
	}

	// keyboard management
	elCPU.element.addEventListener('keydown', trigger.key);

	// throbber management
	const timeline_element = elCPU.shadowId('time');
	timeline_element?.addEventListener('pointerenter', trigger.hover, passiveEvent);
	timeline_element?.addEventListener('pointermove', trigger.hover, passiveEvent);
	timeline_element?.addEventListener('pointerout', trigger.out, passiveEvent);
	// alternative fine navigation for handhelds
	timeline_element?.addEventListener('contextmenu', () => {elCPU.showHandheldNav();});

	if (navigator.share) {
		interface_classlist.add('hasnativeshare');
		elCPU.shadowId('nativeshare')?.addEventListener('click', nativeShare, passiveEvent);
	}

	let canonical_element = elCPU.shadowId('canonical'); 
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