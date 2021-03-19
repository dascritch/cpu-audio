import {on_debug} from './utils.js';
import {trigger} from './trigger.js';

// Repeated event allocation
let pressing = null;
const acceptable_press_actions = ['fastreward', 'reward', 'foward', 'fastfoward'];

// TODO explode between manager_press and manager_touch

// Handheld navigation button process
// @private
export class press_manager {
	/*
	 * @summary Start handheld navigation button press
	 * @private
	 *
	 * @param      {Object}  event   The event
	 */
	press(event) {
		let target = event.target.id ? event.target : event.target.closest('button');
		if ( (!target.id) || (!acceptable_press_actions.includes(target.id))) {
			// we have been misleaded
			return;
		}
		// execute the associated function
		trigger[target.id](event);
		if (pressing) {
			window.clearTimeout(pressing);
		}

		let mini_event = {
			target : target,
			preventDefault : on_debug
		};
		pressing = window.setTimeout(press_manager.repeat, document.CPU.repeat_delay, mini_event);
		event.preventDefault();
	}
	/*
	 * @summary Repeat during pressing handheld navigation button
	 * @private
	 *
	 * @param      {Object}  event   The event
	 */
	repeat(event) {
		//
		trigger[event.target.id](event);
		// next call : repetition are closest
		pressing = window.setTimeout(press_manager.repeat, document.CPU.repeat_factor, event);
	}
	/*
	 * @summary Release handheld navigation button
	 * @private
	 *
	 * @param      {Object}  event   The event
	 */
	release(event) {
		window.clearTimeout(pressing);
		pressing = null;
		event.preventDefault();
	}
}

// touch is occuring
let touching = null;

export class touch_manager {
	/**
	 * @summary Interprets long play on timeline to reveal alternative fine position panel
	 */
	
	/**
	 * @summary Press started on the timeline
	 *
	 * @param      {Object}  event   The event
	 */
	start({target}) {
		let container = document.CPU.find_container(target);
		touching = setTimeout(container.show_handheld_nav.bind(container), document.CPU.alternate_delay);
	}
	/**
	 * @summary Press stoped on the timeline
	 *
	 * @param      {Object}  event   The event
	 */
	cancel() {
		clearTimeout(touching);
	}

	/**
	 * @summary Menu launch. Right Mouse Button on desktop, but may be a pointer long-press, we try to avoid this last one
	 *
	 * @param      {Object}  event   The event
	 */
	rmb(event) {
		let container = document.CPU.find_container(event.target);
		if (!touching) {
			container.show_handheld_nav();
		}
		event.preventDefault();
	}
}
