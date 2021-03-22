import {findContainer} from './utils.js';
import {trigger} from './trigger.js';

// Repeated event allocation
let pressing = null;
const acceptable_press_actions = ['fastreward', 'reward', 'foward', 'fastfoward'];

// Handheld navigation button process
// @private
export class pressManager {
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

		pressing = window.setTimeout(pressManager.repeat, document.CPU.repeatDelay, { target });
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
		pressing = window.setTimeout(pressManager.repeat, document.CPU.repeatFactor, event);
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
		let container = findContainer(target);
		touching = setTimeout(container.showHandheldNav.bind(container), document.CPU.alternateDelay);
	}
	/**
	 * @summary Press stoped on the timeline
	 *
	 * @param      {Object}  event   The event
	 */
	cancel() {
		clearTimeout(touching);
	}

}
