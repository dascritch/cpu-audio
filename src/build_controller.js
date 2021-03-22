import {passive_ev, querySelector_apply, findContainer, element_prevent_link_on_same_page} from './utils.js';
import {trigger} from './trigger.js';
import {press_manager, touch_manager} from './finger_manager.js';
import {build_chapters_loader} from './build_chapters.js';

/**
 * @summary Interprets `navigator.share` native API
 *
 * @param      {Object}  event   The event
 */
function native_share(event) {
	let {title, canonical} = findContainer(event.target).fetch_audiotag_dataset();
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
export function build_controller(container) {
	let interface_classlist = container.shadowId('interface').classList;

	// hide broken image while not loaded
	container.shadowId('poster').addEventListener('load', () => {
		interface_classlist.add('poster-loaded');
	}, passive_ev);

	let show_main = container.show_main.bind(container);

	let cliquables = {
		pause     : trigger.play,
		play      : trigger.pause,
		time      : trigger.throbble,
		actions   : container.show_actions.bind(container),
		back      : show_main,
		poster    : show_main,
		restart   : trigger.restart,
	};
	for (let that in cliquables) {
		container.shadowId(that).addEventListener('click', cliquables[that], passive_ev);
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
			element_id.addEventListener(_act, _actions[_act] ? press_manager.press : press_manager.release);
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
			passive_ev);
	}
	// alternative fine navigation for handhelds
	timeline_element.addEventListener('touchstart', touch_manager.start, passive_ev);
	timeline_element.addEventListener('touchend', touch_manager.cancel, passive_ev);
	timeline_element.addEventListener('contextmenu', container.show_handheld_nav.bind(container));

	if (navigator.share) {
		interface_classlist.add('hasnativeshare');
		container.shadowId('nativeshare').addEventListener('click', native_share, passive_ev);
	}

	if (!container.audiotag)  {
		// <cpu-controller> without <cpu-audio> , see https://github.com/dascritch/cpu-audio/issues/91
		return;
	}

	container.audiotag.addEventListener('durationchange', container.reposition_tracks.bind(container), passive_ev);

	container.show_main();
	build_chapters_loader(container);
	container.fire_event('ready');

	querySelector_apply('#canonical', element_prevent_link_on_same_page, container.shadowRoot);
}