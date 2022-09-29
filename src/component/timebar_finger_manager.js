import { findCPU } from '../primitives/utils.js';

export const timebar_finger_manager = {
	ev : null,
	down : function ({target}) {
		timebar_finger_manager.ev = setTimeout(timebar_finger_manager.do, document.CPU.alternateDelay, findCPU(target));
	},
	do : function (elCPU) {
		elCPU.showHandheldNav();
		timebar_finger_manager.ev = null;
	},
	up : function () {
		clearTimeout(timebar_finger_manager.ev);
		timebar_finger_manager.ev = null;
	}
};


export default timebar_finger_manager;