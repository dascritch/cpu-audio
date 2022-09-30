import { findCPU } from '../primitives/utils.js';

let ev = null;

/**
 * @summary Action on a pointerdown Event
 *
 * @param      {Object}  							event     The event
 */
export function down({target}) {
	ev = setTimeout(act, document.CPU.alternateDelay, findCPU(target));
}

/**
 * @summary Repeated action during the pointer pressed
 *
 * @param      {Object}  							Component.CPU     Active component under the pointer
 */
function act(elCPU) {
	elCPU.showHandheldNav();
	ev = null;
}

/**
 * @summary Action for the release of the pointer
 */
export function up() {
	clearTimeout(ev);
	ev = null;
}

export const timebar_finger_manager = {
	down,
	act,
	up
};

export default timebar_finger_manager;