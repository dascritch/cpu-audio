import trigger from '../trigger/trigger.js';


// Repeated event allocation
let pressing = null;
export const acceptable_press_actions = ['fastreward', 'reward', 'foward', 'fastfoward'];

/**
 * @summary Start handheld navigation button press
 * @private
 *
 * @param      {Object}  event   The event
 */
export function press(event) {
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
	pressing = window.setTimeout(repeat, document.CPU.repeatDelay, event);
	event.preventDefault();
}

/**
 * @summary Repeat during pressing handheld navigation button
 * @private
 *
 * @param      {Object}  event   The event
 */
export function repeat(event) {
	trigger[event.target.id](event);
	// next call : repetition are closest
	pressing = window.setTimeout(repeat, document.CPU.repeatFactor, event);
	event.preventDefault?.();
}

/**
 * @summary Release handheld navigation button
 * @private
 *
 * @param      {Object}  event   The event
 */
export function release(event) {
	window.clearTimeout(pressing);
	pressing = null;
	event.preventDefault();
}

// Handheld navigation button process
// @private
export const finenav_finger_manager = {
	press,
	repeat,
	release
};

export default finenav_finger_manager;