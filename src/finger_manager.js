import {trigger} from './trigger.js';

// Repeated event allocation
let pressing = null;
const acceptable_press_actions = ['fastreward', 'reward', 'foward', 'fastfoward'];

// Handheld navigation button process
// @private
export const pressManager = {
	/*
	 * @summary Start handheld navigation button press
	 * @private
	 *
	 * @param      {Object}  event   The event
	 */
	press : function (event) {
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
	},
	/*
	 * @summary Repeat during pressing handheld navigation button
	 * @private
	 *
	 * @param      {Object}  event   The event
	 */
	repeat : function (event) {
		trigger[event.target.id](event);
		// next call : repetition are closest
		pressing = window.setTimeout(pressManager.repeat, document.CPU.repeatFactor, event);
		event.preventDefault?.();
	},
	/*
	 * @summary Release handheld navigation button
	 * @private
	 *
	 * @param      {Object}  event   The event
	 */
	release : function (event) {
		window.clearTimeout(pressing);
		pressing = null;
		event.preventDefault();
	}
};
