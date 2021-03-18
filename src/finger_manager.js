import {on_debug} from './utils.js';
import {trigger} from './trigger.js';

// Repeated event allocation
let is_on = null;

// Handheld navigation button process
// @private
export let finger_manager = {
	/*
	 * @summary Start handheld navigation button press
	 * @private
	 *
	 * @param      {Object}  event   The event
	 */
	press : function(event) {
		let target = event.target.id ? event.target : event.target.closest('button');
		let acceptable_actions = ['fastreward', 'reward', 'foward', 'fastfoward'];
		if ( (!target.id) || (!acceptable_actions.includes(target.id))) {
			// we have been misleaded
			return;
		}
		// execute the associated function
		trigger[target.id](event);
		if (is_on) {
			window.clearTimeout(is_on);
		}

		let mini_event = {
			target : target,
			preventDefault : on_debug
		};
		is_on = window.setTimeout(finger_manager.repeat, document.CPU.repeat_delay, mini_event);
		event.preventDefault();
	},
	/*
	 * @summary Repeat during pressing handheld navigation button
	 * @private
	 *
	 * @param      {Object}  event   The event
	 */
	repeat : function(event) {
		//
		trigger[event.target.id](event);
		// next call : repetition are closest
		is_on = window.setTimeout(finger_manager.repeat, document.CPU.repeat_factor, event);
	},
	/*
	 * @summary Release handheld navigation button
	 * @private
	 *
	 * @param      {Object}  event   The event
	 */
	release : function(event) {
		window.clearTimeout(is_on);
		is_on = null;
		event.preventDefault();
	},

	/**
	 * @summary Interprets long play on timeline to reveal alternative fine position panel
	 */
	touching : null,
	/**
	 * @summary Press started on the timeline
	 *
	 * @param      {Object}  event   The event
	 */
	touchstart : function({target}) {
		let container = document.CPU.find_container(target);
		finger_manager.touching = setTimeout(container.show_handheld_nav.bind(container), document.CPU.alternate_delay);
	},
	/**
	 * @summary Press stoped on the timeline
	 *
	 * @param      {Object}  event   The event
	 */
	touchcancel : function(/* event */) {
		clearTimeout(finger_manager.touching);
	},

	/**
	 * @summary Menu launch. Right Mouse Button on desktop, but may be a pointer long-press, we try to avoid this last one
	 *
	 * @param      {Object}  event   The event
	 */
	rmb : function(event) {
		let container = document.CPU.find_container(event.target);
		if (!finger_manager.touching) {
			container.show_handheld_nav();
		}
		event.preventDefault();
	}
};
