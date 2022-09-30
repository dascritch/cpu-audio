import trigger from '../trigger/trigger.js';

// Repeated event allocation
let pressing = null;
export const acceptable_press_actions = ['fastreward', 'reward', 'foward', 'fastfoward'];

// Handheld navigation button process
// @private
export const finenav_finger_manager = {
	/*
	 * @summary Start handheld navigation button press
	 * @private
	 *
	 * @param      {Object}  event   The event
	 */
	press : function (event) {
		const target = event.target.id ? event.target : event.target.closest('button');
		if ( (!target.id) || (!acceptable_press_actions.includes(target.id))) {
			// we have been misleaded
			return;
		}
		// execute the associated function
		trigger[target.id](event);
		if (pressing) {
			window.clearTimeout(pressing);
		}
		pressing = window.setTimeout(finenav_finger_manager.repeat, document.CPU.repeatDelay, event);
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
		pressing = window.setTimeout(finenav_finger_manager.repeat, document.CPU.repeatFactor, event);
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

export default finenav_finger_manager;