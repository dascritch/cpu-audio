import {on_debug} from './utils.js';
import {trigger} from './trigger.js';

// Handheld navigation button process
// @private
export let finger_manager = {
	// Repeated event allocation
	is_on : null,

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
		if (finger_manager.is_on !== null) {
			window.clearTimeout(finger_manager.is_on);
		}

		let mini_event = {
			target : target,
			preventDefault : on_debug
		};
		finger_manager.is_on = window.setTimeout(finger_manager.repeat, document.CPU.repeat_delay, mini_event);
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
		finger_manager.is_on = window.setTimeout(finger_manager.repeat, document.CPU.repeat_factor, event);
	},
	/*
	 * @summary Release handheld navigation button
	 * @private
	 *
	 * @param      {Object}  event   The event
	 */
	release : function(event) {
		window.clearTimeout(finger_manager.is_on);
		finger_manager.is_on = null;
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
	touchstart : function(event) {
		let container = document.CPU.find_container(event.target);
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
