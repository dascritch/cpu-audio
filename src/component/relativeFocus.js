import { adjacentArrayValue } from '../primitives/operators.js';
import { planeAndPointNamesFromId } from './planename.js';

/**
 * @summary relatively browse up or down with focus
 * @private
 */
export function relativeFocus(self, go_foward) {
	const planeNames = self.planeNames();
	if (planeNames.length == 0) {
		return;
	}

	const validPlane = (id) => {
		const {track, panel, points} = self.plane(id);
		return (((track !== false) || (panel !== false))
				&& ((self.planePanel(id)?.clientHeight > 0) || (self.planeTrack(id)?.clientHeight > 0))
				&& (points)
				&& (Object.keys(points).length > 0));
	};
	const scanToPrevPlane = (fromPlane) => {
		for(let id = planeNames.indexOf(fromPlane) -1; id >= 0 ; id--) {
			const out = planeNames[id];
			if (validPlane(out)) {
				return out;
			}
		}
	};
	const scanToNextPlane = (fromPlane) => {
		for (let id = planeNames.indexOf(fromPlane) +1; id < planeNames.length ; id++) {
			const out = planeNames[id];
			if (validPlane(out)) {
				return out;
			}
		}
	};

	let planeName, pointName, planePointNames;
	let wasFocused = self.focused();
	if (wasFocused) {
		if (!wasFocused.id) {
			wasFocused = wasFocused.closest('[id]');
		}
		({planeName, pointName} = planeAndPointNamesFromId(wasFocused.id));
	}
	if (pointName != '') {  // NOTE : loosy comparison is important
		planePointNames = self.planePointNames(planeName);
		pointName = adjacentArrayValue(planePointNames, pointName, go_foward ? 1 : -1);
	}
	if (!pointName) {
		planeName = go_foward ? scanToNextPlane(planeName) : scanToPrevPlane(planeName);
		if (!planeName) {
			return;
		}
		const points = self.planePointNames(planeName);
		pointName = points[go_foward ? 0 : (points.length - 1)];
	}
	self.focusPoint(planeName, pointName);
}

export default relativeFocus;
