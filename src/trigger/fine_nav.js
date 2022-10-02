import { findCPU } from '../primitives/utils.js';

import { key, KEY_LEFT_ARROW, KEY_RIGHT_ARROW } from './key.js';


/**
 * @summary Pressing restart button, Rewind at start the audio tag
 *
 * @param      {Object}  event   The event
 */
export function restart({target}) {
	const container = findCPU(target);
	document.CPU.seekElementAt(container.audiotag, 0);
}


export const fine_nav = {

	restart,

	/**
	 * @summary Pressing reward button
	 *
	 * @param      {Object}  event   The event
	 */
	reward : function(event) {
		// NEVER try to use a {...event, keyCode:} notation for extending an event : it kills the event.target
		event.keyCode = KEY_LEFT_ARROW;
		key(event);
	},
	/**
	 * @summary Pressing foward button
	 * Function associated, see below, DO NOT RENAME
	 *
	 * @param      {Object}  event   The event
	 */
	foward : function(event) {
		event.keyCode = KEY_RIGHT_ARROW;
		key(event);
	},
	/**
	 * @summary Pressing fastreward button
	 * Function associated, see below, DO NOT RENAME
	 *
	 * @param      {Object}  event   The event
	 */
	fastreward : function(event) {
		event.keyCode = KEY_LEFT_ARROW;
		key(event, document.CPU.fastFactor);
	},
	/**
	 * @summary Pressing fastfoward button
	 * Function associated, see below, DO NOT RENAME
	 *
	 * @param      {Object}  event   The event
	 */
	fastfoward : function(event) {
		event.keyCode = KEY_RIGHT_ARROW;
		key(event, document.CPU.fastFactor);
	},
};

export default fine_nav;