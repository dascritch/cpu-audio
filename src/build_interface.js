import {passiveEvent, findCPU, preventLinkOnSamePage} from './utils.js';
import {trigger} from './trigger.js';
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
 * @param      {Object}  			container  <cpu-audio>.CPU
 *
 * @summary Builds the controller.
 */
export function buildInterface(container) {
	const interface_classlist = container.shadowId('interface').classList;

	// hide broken image while not loaded
	container.shadowId('poster')?.addEventListener('load', () => {
		interface_classlist.add('poster-loaded');
	}, passiveEvent);

	// main buttons management
	let cliquables = {
		pause      : trigger.pause,
		play       : trigger.play,
		time       : trigger.throbble,
		actions    : () => {container.showActions();},
		back       : () => {container.showMain();},
		poster     : () => {container.showMain();},
		restart    : trigger.restart,
		toggleplay : trigger.toggleplay,
		prevtrack  : trigger.prevtrack,
		nexttrack  : trigger.nexttrack
	};
	for (let elementId in cliquables) {
		container.shadowId(elementId)?.addEventListener('click', cliquables[elementId], passiveEvent);
	}

	// relative browsing buttons management
	//  *ward : handheld nav to allow long press to repeat action
	const _buttons = ['prevcue', 'fastreward', 'reward', 'foward', 'fastfoward', 'nextcue'];
	for (let elementId of _buttons) {
		const button_element = container.shadowId(elementId);
		button_element?.addEventListener('pointerdown', pressManager.press);
		button_element?.addEventListener('pointerout', pressManager.release);
		button_element?.addEventListener('pointerup', pressManager.release);
	}

	// keyboard management
	container.element.addEventListener('keydown', trigger.key);

	// throbber management
	const timeline_element = container.shadowId('time');
	timeline_element?.addEventListener('pointerenter', trigger.hover, passiveEvent);
	timeline_element?.addEventListener('pointermove', trigger.hover, passiveEvent);
	timeline_element?.addEventListener('pointerout', trigger.out, passiveEvent);
	// alternative fine navigation for handhelds
	timeline_element?.addEventListener('contextmenu', () => {container.showHandheldNav();});

	if (navigator.share) {
		interface_classlist.add('hasnativeshare');
		container.shadowId('nativeshare')?.addEventListener('click', nativeShare, passiveEvent);
	}

	if (!container.audiotag)  {
		// <cpu-controller> without <cpu-audio> , see https://github.com/dascritch/cpu-audio/issues/91
		return;
	}

	container.audiotag.addEventListener('durationchange', () => {container.repositionTracks(); }, passiveEvent);

	buildChaptersLoader(container);
	buildPlaylist();
	container.showMain();
	container.updatePlayButton();
	container.emitEvent('ready');

	container.updateLinks();

	let canonical_element = container.shadowId('canonical'); 
	if (canonical_element) {
		preventLinkOnSamePage( canonical_element );
	}
}