import {passiveEvent, querySelectorDo, findContainer, preventLinkOnSamePage} from './utils.js';
import {trigger} from './trigger.js';
import {pressManager, touch_manager} from './finger_manager.js';
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
	container.shadowId('poster').addEventListener('load', () => {
		interface_classlist.add('poster-loaded');
	}, passiveEvent);

	let showMain = container.showMain.bind(container);

	let cliquables = {
		pause     : trigger.play,
		play      : trigger.pause,
		time      : trigger.throbble,
		actions   : container.showActions.bind(container),
		back      : showMain,
		poster    : showMain,
		restart   : trigger.restart,
	};
	for (let that in cliquables) {
		container.shadowId(that).addEventListener('click', cliquables[that], passiveEvent);
	}

	// handheld nav to allow long press to repeat action
	let _buttons = ['fastreward', 'reward', 'foward', 'fastfoward'];
	let _actions = {
		touchstart    : true,
		touchend      : false,
		touchcancel   : false,
		/* PHRACKING IOS PHRACKING SAFARI PHRACKING APPLE */
		mousedown     : true,
		mouseup       : false,
		mouseleave    : false
	};
	for (let that of _buttons) {
		const element_id = container.shadowId(that);
		for (let _act in _actions) {
			element_id.addEventListener(_act, _actions[_act] ? pressManager.press : pressManager.release);
		}
	}

	// keyboard management
	container.element.addEventListener('keydown', trigger.key);

	// not working correctly :/
	container.shadowId('control').addEventListener('keydown', trigger.keydownplay);
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
	timeline_element.addEventListener('touchstart', touch_manager.start, passiveEvent);
	timeline_element.addEventListener('touchend', touch_manager.cancel, passiveEvent);
	timeline_element.addEventListener('contextmenu', container.showHandheldNav.bind(container));

	if (navigator.share) {
		interface_classlist.add('hasnativeshare');
		container.shadowId('nativeshare').addEventListener('click', nativeShare, passiveEvent);
	}

	if (!container.audiotag)  {
		// <cpu-controller> without <cpu-audio> , see https://github.com/dascritch/cpu-audio/issues/91
		return;
	}

	container.audiotag.addEventListener('durationchange', container.repositionTracks.bind(container), passiveEvent);

	container.showMain();
	container.updatePlayButton();
	buildChaptersLoader(container);
	if (container.isController) {
		buildPlaylist(container);
	}
	container.emitEvent('ready');

	querySelectorDo('#canonical', preventLinkOnSamePage, container.shadowRoot);
}