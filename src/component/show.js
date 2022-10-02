import { findCPU } from '../primitives/utils.js';

import { planeAndPointNamesFromId } from './planename.js';

const hidingClassname = 'no';

/**
 * @summary    Highlight the playable positions when hovering a marked link
 *
 * @param      {Object}  event   An hover event
 */
export function previewContainerHover({target}) {
	if (!target.id) {
		target = target.closest('[id]');
	}
	if (!target) {
		return;
	}

	const {planeName, pointName} = planeAndPointNamesFromId(target.id);
	findCPU(target).highlightPoint(planeName, pointName);
}


/**
 * @summary Show or hide an element
 *
 * @param      {Element} element  	The element to show or hide
 * @param      {boolean} show 		Show if true, hide if false
 */
export function showElement({classList}, show) {
	if (show) {
		classList.remove(hidingClassname);
	} else {
		classList.add(hidingClassname);
	}
}