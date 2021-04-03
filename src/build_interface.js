import {passiveEvent, findContainer, preventLinkOnSamePage} from './utils.js';
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
	let {title, canonical} = findContainer(event.target).audiotagDataset();
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
	let interface_classlist = container.shadowId('interface').classList;

	// hide broken image while not loaded
	container.shadowId('poster')?.addEventListener('load', () => {
		interface_classlist.add('poster-loaded');
	}, passiveEvent);

	let showMain = container.showMain.bind(container);

	// main buttons management
	let cliquables = {
		pause     : trigger.pause,
		play      : trigger.play,
		time      : trigger.throbble,
		actions   : container.showActions.bind(container),
		back      : showMain,
		poster    : showMain,
		restart   : trigger.restart,
	};
	for (let that in cliquables) {
		container.shadowId(that)?.addEventListener('click', cliquables[that], passiveEvent);
	}

	// relative browsing buttons management
	//  *ward : handheld nav to allow long press to repeat action
	let _buttons = ['prevcue', 'fastreward', 'reward', 'foward', 'fastfoward', 'nextcue'];
	for (let that of _buttons) {
		const button_element = container.shadowId(that);
		button_element?.addEventListener('pointerdown', pressManager.press);
		button_element?.addEventListener('pointerout', pressManager.release);
		button_element?.addEventListener('pointerup', pressManager.release);
	}

	// keyboard management
	container.element.addEventListener('keydown', trigger.key);

	// throbber management
	let timeline_element = container.shadowId('time');
	let do_events = {
		mouseover   : true,
		mousemove   : true,
		mouseout    : false,

		touchstart  : true,
		touchend    : false,
		touchcancel : false,
	};
	for (let event_name in do_events) {
		timeline_element.addEventListener(
			event_name,
			do_events[event_name] ? trigger.hover : trigger.out,
			passiveEvent);
	}
	// alternative fine navigation for handhelds
	timeline_element.addEventListener('contextmenu', container.showHandheldNav.bind(container));

	if (navigator.share) {
		interface_classlist.add('hasnativeshare');
		container.shadowId('nativeshare')?.addEventListener('click', nativeShare, passiveEvent);
	}

	if (!container.audiotag)  {
		// <cpu-controller> without <cpu-audio> , see https://github.com/dascritch/cpu-audio/issues/91
		return;
	}

	container.audiotag.addEventListener('durationchange', container.repositionTracks.bind(container), passiveEvent);

	buildChaptersLoader(container);
	if (container.isController) {
		buildPlaylist(container);
	}
	container.showMain();
	container.updatePlayButton();
	container.emitEvent('ready');

	container.updateLinks();

	let canonical_element = container.shadowId('canonical'); 
	if (canonical_element) {
		preventLinkOnSamePage( canonical_element );
	}
}